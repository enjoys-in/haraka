import fs from 'node:fs';
import path from 'node:path';
import { HARAKA_ROOT, OUTBOUND_LOG_DIR } from '../../config';

export type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  plugin: string | null;
  connectionId: string | null;
  message: string;
}

function levelFrom(value: unknown): LogLevel {
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (v === 'debug' || v === 'info' || v === 'notice' || v === 'warn' || v === 'error' || v === 'crit') {
      return v;
    }
  }
  if (typeof value === 'number') {
    if (value >= 60) return 'crit';
    if (value >= 50) return 'error';
    if (value >= 40) return 'warn';
    if (value >= 30) return 'info';
    if (value >= 20) return 'notice';
    return 'debug';
  }
  return 'info';
}

function timeFrom(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

function getLogDirs(): string[] {
  const dirs = [
    OUTBOUND_LOG_DIR,
    path.join(HARAKA_ROOT, 'logs', 'outbound'),
    path.join(HARAKA_ROOT, 'outbound', 'logs', 'outbound'),
  ];
  return [...new Set(dirs)];
}

function readLines(filePath: string): string[] {
  try {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function logFiles(limit = 3): string[] {
  const files: string[] = [];
  for (const dir of getLogDirs()) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.log') || name.endsWith('.json') || name.endsWith('.txt'))
      .map((name) => ({ name, mtime: fs.statSync(path.join(dir, name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, limit)
      .map((e) => path.join(dir, e.name));
    files.push(...entries);
  }
  return [...new Set(files)];
}

function toEntry(raw: Record<string, unknown>, fallbackKey: string): LogEntry {
  const ts = timeFrom(raw.time);
  const type = typeof raw.type === 'string' ? raw.type : 'event';
  const recipient = typeof raw.recipient === 'string' ? raw.recipient : '';
  const from = typeof raw.from === 'string' ? raw.from : '';
  const smtpResponse = typeof raw.smtp_response === 'string' ? raw.smtp_response : '';
  const reason = typeof raw.undelivered_reason === 'string' ? raw.undelivered_reason : '';
  const msg =
    (typeof raw.msg === 'string' && raw.msg) ||
    [type, recipient && `to=${recipient}`, from && `from=${from}`, smtpResponse || reason]
      .filter(Boolean)
      .join(' ');

  return {
    id: `${fallbackKey}-${ts}`,
    timestamp: ts,
    level: levelFrom(raw.level),
    plugin: (typeof raw.name === 'string' && raw.name) || 'outbound-logger',
    connectionId: (typeof raw.job_id === 'string' && raw.job_id) || null,
    message: msg,
  };
}

export function listLogs(limit = 200): LogEntry[] {
  const out: LogEntry[] = [];
  for (const filePath of logFiles()) {
    const lines = readLines(filePath);
    for (let i = Math.max(0, lines.length - limit); i < lines.length; i += 1) {
      const line = lines[i];
      try {
        const raw = JSON.parse(line) as Record<string, unknown>;
        out.push(toEntry(raw, `${path.basename(filePath)}:${i}`));
      } catch {
        out.push({
          id: `${path.basename(filePath)}:${i}:raw`,
          timestamp: Date.now(),
          level: 'info',
          plugin: 'outbound-logger',
          connectionId: null,
          message: line,
        });
      }
    }
  }

  return out
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
