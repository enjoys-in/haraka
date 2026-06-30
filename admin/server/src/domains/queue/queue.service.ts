// Queue domain: the Haraka outbound spool (HARAKA_ROOT/queue). Each file is a
// HMail qfile whose NAME encodes scheduling and whose body starts with a
// 4-byte big-endian length prefix followed by the JSON "TODO" then the message.
//   name = arrival_nextAttempt_attempts_pid_uniq_counter_host
import fs from 'node:fs';
import path from 'node:path';
import { HARAKA_ROOT } from '../../config';

const QUEUE_DIR = process.env.HARAKA_QUEUE_DIR || path.join(HARAKA_ROOT, 'queue');

export type QueueState = 'queued' | 'sending' | 'deferred' | 'frozen' | 'bounced';

export interface QueuedMessage {
  id: string;
  from: string;
  to: string[];
  subject: string;
  size: number;
  state: QueueState;
  attempts: number;
  nextRetryAt: number | null;
  lastError: string | null;
  queuedAt: number;
}

export interface QueueSummary {
  total: number;
  deferred: number;
  sending: number;
  frozen: number;
  oldestAgeSeconds: number;
}

interface ParsedName {
  arrival: number;
  nextAttempt: number;
  attempts: number;
}

function parseName(name: string): ParsedName {
  const parts = name.split('_');
  return {
    arrival: Number(parts[0]) || 0,
    nextAttempt: Number(parts[1]) || 0,
    attempts: Number(parts[2]) || 0,
  };
}

function addressText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o.original === 'string') return o.original;
    if (typeof o.address === 'string') return o.address;
    if (typeof o.user === 'string' && typeof o.host === 'string') return `${o.user}@${o.host}`;
  }
  return '';
}

function readTodo(filePath: string): { todo: Record<string, unknown>; subject: string } {
  const fd = fs.openSync(filePath, 'r');
  try {
    const lenBuf = Buffer.alloc(4);
    fs.readSync(fd, lenBuf, 0, 4, 0);
    const todoLen = lenBuf.readUInt32BE(0);
    if (todoLen <= 0 || todoLen > 1024 * 1024) return { todo: {}, subject: '' };
    const todoBuf = Buffer.alloc(todoLen);
    fs.readSync(fd, todoBuf, 0, todoLen, 4);
    const todo = JSON.parse(todoBuf.toString('utf8')) as Record<string, unknown>;

    // Peek a slice of the message for a Subject header (best effort).
    const head = Buffer.alloc(4096);
    const read = fs.readSync(fd, head, 0, head.length, 4 + todoLen);
    const m = head.toString('utf8', 0, read).match(/^subject:\s*(.+)$/im);
    return { todo, subject: m ? m[1].trim() : '' };
  } finally {
    fs.closeSync(fd);
  }
}

function toMessage(name: string): QueuedMessage | null {
  const filePath = path.join(QUEUE_DIR, name);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return null;
  }
  if (!stat.isFile()) return null;

  const { arrival, nextAttempt, attempts } = parseName(name);
  let from = '';
  let to: string[] = [];
  let subject = '';
  try {
    const { todo, subject: subj } = readTodo(filePath);
    from = addressText(todo.mail_from);
    if (Array.isArray(todo.rcpt_to)) to = todo.rcpt_to.map(addressText).filter(Boolean);
    subject = subj;
  } catch {
    // Unreadable/locked qfile — fall back to name-derived data only.
  }

  return {
    id: name,
    from,
    to,
    subject,
    size: stat.size,
    state: attempts > 0 ? 'deferred' : 'queued',
    attempts,
    nextRetryAt: nextAttempt || null,
    lastError: null,
    queuedAt: arrival || stat.mtimeMs,
  };
}

export function listQueue(): QueuedMessage[] {
  let names: string[];
  try {
    names = fs.readdirSync(QUEUE_DIR);
  } catch {
    return [];
  }
  return names
    .filter((n) => !n.startsWith('.'))
    .map(toMessage)
    .filter((m): m is QueuedMessage => m !== null)
    .sort((a, b) => a.queuedAt - b.queuedAt);
}

export function queueSummary(messages: QueuedMessage[]): QueueSummary {
  const now = Date.now();
  let oldest = 0;
  for (const m of messages) {
    if (m.queuedAt && now - m.queuedAt > oldest) oldest = now - m.queuedAt;
  }
  return {
    total: messages.length,
    deferred: messages.filter((m) => m.state === 'deferred').length,
    sending: messages.filter((m) => m.state === 'sending').length,
    frozen: messages.filter((m) => m.state === 'frozen').length,
    oldestAgeSeconds: Math.round(oldest / 1000),
  };
}

export interface QueueView {
  summary: QueueSummary;
  messages: QueuedMessage[];
}

export function readQueue(): QueueView {
  const messages = listQueue();
  return { summary: queueSummary(messages), messages };
}

// Queue filenames are a fixed set of `_`-joined fields ending in the dest host;
// allow only those characters so an id can never escape QUEUE_DIR.
const SAFE_QUEUE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function queueFilePath(id: string): string {
  if (!SAFE_QUEUE_ID.test(id)) throw new Error('Invalid queue id');
  const filePath = path.join(QUEUE_DIR, id);
  if (path.dirname(filePath) !== path.resolve(QUEUE_DIR)) throw new Error('Invalid queue id');
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) throw new Error('Not a queue file');
  return filePath;
}

/** Reschedule a queued message for immediate delivery by rewriting the
 *  `nextAttempt` field (the 2nd `_`-segment) of its filename to now. */
export function retryQueueItem(id: string): { id: string } {
  const filePath = queueFilePath(id);
  const parts = id.split('_');
  if (parts.length < 3) throw new Error('Unrecognized queue filename');
  parts[1] = String(Date.now());
  const newId = parts.join('_');
  if (newId !== id) fs.renameSync(filePath, path.join(QUEUE_DIR, newId));
  return { id: newId };
}

/** Permanently delete a message from the outbound spool. */
export function deleteQueueItem(id: string): void {
  fs.unlinkSync(queueFilePath(id));
}
