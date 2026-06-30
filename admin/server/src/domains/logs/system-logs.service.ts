// Streams Haraka's core/system log (the process stdout, redirected to a file)
// to the admin UI. Lines are parsed from Haraka's default log format
//   [LEVEL] [connId] [plugin] message
// into the same LogEntry shape used by the outbound logger view.
import fs from 'node:fs';
import { HARAKA_LOG_FILE } from '../../config';
import type { LogEntry, LogLevel } from './logs.service';

// Haraka log severities → the UI's coarser level set.
const HARAKA_LEVELS: Record<string, LogLevel> = {
  DATA: 'debug',
  PROTOCOL: 'debug',
  DEBUG: 'debug',
  INFO: 'info',
  NOTICE: 'notice',
  WARN: 'warn',
  ERROR: 'error',
  CRIT: 'crit',
  ALERT: 'crit',
  EMERG: 'crit',
};

// [LEVEL] [connId] [plugin] message
const THREE_BRACKET = /^\[([A-Z]+)\]\s+\[([^\]]*)\]\s+\[([^\]]*)\]\s+([\s\S]*)$/;
// [LEVEL] [plugin] message  (older format without a connection id)
const TWO_BRACKET = /^\[([A-Z]+)\]\s+\[([^\]]*)\]\s+([\s\S]*)$/;

/** Parse one raw Haraka log line into a structured entry. */
export function parseHarakaLine(line: string, id: string): LogEntry {
  const now = Date.now();

  const three = THREE_BRACKET.exec(line);
  if (three && HARAKA_LEVELS[three[1]]) {
    return {
      id,
      timestamp: now,
      level: HARAKA_LEVELS[three[1]],
      plugin: three[3] || null,
      connectionId: three[2] && three[2] !== '-' ? three[2] : null,
      message: three[4],
    };
  }

  const two = TWO_BRACKET.exec(line);
  if (two && HARAKA_LEVELS[two[1]]) {
    return {
      id,
      timestamp: now,
      level: HARAKA_LEVELS[two[1]],
      plugin: two[2] || null,
      connectionId: null,
      message: two[3],
    };
  }

  // Unstructured line (startup banners, stack traces, etc.).
  return { id, timestamp: now, level: 'info', plugin: null, connectionId: null, message: line };
}

/** Read at most `maxBytes` from the end of a file, dropping a partial first line. */
function readTailBytes(file: string, maxBytes: number): string {
  const { size } = fs.statSync(file);
  const start = Math.max(0, size - maxBytes);
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    let text = buf.toString('utf8');
    if (start > 0) {
      const nl = text.indexOf('\n');
      if (nl >= 0) text = text.slice(nl + 1);
    }
    return text;
  } finally {
    fs.closeSync(fd);
  }
}

/** Snapshot of the most recent system log lines, newest first. */
export function readSystemLog(limit = 300): LogEntry[] {
  let text: string;
  try {
    text = readTailBytes(HARAKA_LOG_FILE, 512 * 1024);
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  const tail = lines.slice(Math.max(0, lines.length - limit));
  return tail.map((line, i) => parseHarakaLine(line, `sys:init:${i}`)).reverse();
}

export interface SystemLogTailer {
  stop(): void;
}

/**
 * Follow the system log file and invoke `onLines` with newly appended,
 * parsed entries. Starts at the current end of the file so only fresh lines
 * are emitted. Handles truncation/rotation (size shrinking) by resetting.
 */
export function tailSystemLog(
  onLines: (entries: LogEntry[]) => void,
  intervalMs = 1000,
): SystemLogTailer {
  const file = HARAKA_LOG_FILE;
  let offset = 0;
  let remainder = '';
  let seq = 0;

  try {
    offset = fs.statSync(file).size;
  } catch {
    offset = 0;
  }

  const tick = () => {
    let size: number;
    try {
      size = fs.statSync(file).size;
    } catch {
      return; // file not present yet
    }
    if (size < offset) {
      offset = 0; // rotated or truncated
      remainder = '';
    }
    if (size <= offset) return;

    let chunk: string;
    const fd = fs.openSync(file, 'r');
    try {
      const buf = Buffer.alloc(size - offset);
      fs.readSync(fd, buf, 0, buf.length, offset);
      chunk = buf.toString('utf8');
    } catch {
      return;
    } finally {
      fs.closeSync(fd);
    }
    offset = size;

    const parts = (remainder + chunk).split(/\r?\n/);
    remainder = parts.pop() ?? '';
    const entries = parts
      .filter(Boolean)
      .map((line) => parseHarakaLine(line, `sys:${seq++}`));
    if (entries.length) onLines(entries);
  };

  const timer = setInterval(tick, intervalMs);
  return { stop: () => clearInterval(timer) };
}
