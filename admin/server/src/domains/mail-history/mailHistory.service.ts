// Mail history domain: real outbound delivery records parsed from Haraka's
// outbound JSON delivery logs (the same files the logs domain reads). Each
// delivery line carries recipient/from/host/smtp_response/disposition.
import fs from 'node:fs';
import path from 'node:path';
import { HARAKA_ROOT, OUTBOUND_LOG_DIR } from '../../config';

export type MailDirection = 'inbound' | 'outbound';

export type DeliveryStatus =
  | 'delivered'
  | 'received'
  | 'deferred'
  | 'bounced'
  | 'rejected'
  | 'quarantined';

export interface MailRecord {
  id: string;
  direction: MailDirection;
  from: string;
  to: string;
  subject: string;
  status: DeliveryStatus;
  size: number;
  spamScore: number | null;
  remoteHost: string;
  timestamp: number;
}

function logDirs(): string[] {
  return [
    ...new Set([
      OUTBOUND_LOG_DIR,
      path.join(HARAKA_ROOT, 'logs', 'outbound'),
      path.join(HARAKA_ROOT, 'outbound', 'logs', 'outbound'),
    ]),
  ];
}

function logFiles(limit = 5): string[] {
  const files: string[] = [];
  for (const dir of logDirs()) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs
      .readdirSync(dir)
      .filter((n) => n.endsWith('.log') || n.endsWith('.json') || n.endsWith('.txt'))
      .map((n) => ({ n, mtime: fs.statSync(path.join(dir, n)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, limit)
      .map((e) => path.join(dir, e.n));
    files.push(...entries);
  }
  return [...new Set(files)];
}

function statusFrom(raw: Record<string, unknown>): DeliveryStatus | null {
  const type = String(raw.type || raw.disposition || '').toLowerCase();
  if (type.includes('deliver') || type === 'sent') return 'delivered';
  if (type.includes('defer') || type.includes('tempfail') || type.includes('temp')) return 'deferred';
  if (type.includes('bounce') || type.includes('fail') || type.includes('reject')) return 'bounced';
  // Some loggers omit a type but include an SMTP response — infer from the code.
  const resp = String(raw.smtp_response || '');
  const code = resp.match(/\b([245])\d\d\b/);
  if (code) {
    if (code[1] === '2') return 'delivered';
    if (code[1] === '4') return 'deferred';
    return 'bounced';
  }
  if (raw.undelivered_reason) return 'deferred';
  return null;
}

function timeFrom(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const t = Date.parse(value);
    if (!Number.isNaN(t)) return t;
  }
  return Date.now();
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function listMailHistory(limit = 200): MailRecord[] {
  const out: MailRecord[] = [];
  for (const filePath of logFiles()) {
    let lines: string[];
    try {
      lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
    } catch {
      continue;
    }
    for (let i = 0; i < lines.length; i += 1) {
      let raw: Record<string, unknown>;
      try {
        raw = JSON.parse(lines[i]) as Record<string, unknown>;
      } catch {
        continue;
      }
      const status = statusFrom(raw);
      if (!status) continue;
      const ts = timeFrom(raw.time);
      out.push({
        id: `${path.basename(filePath)}:${i}`,
        direction: 'outbound',
        from: String(raw.from || raw.mail_from || ''),
        to: String(raw.recipient || raw.rcpt || ''),
        subject: String(raw.subject || ''),
        status,
        size: num(raw.bytes ?? raw.size),
        spamScore: raw.spam_score != null ? num(raw.spam_score) : null,
        remoteHost: String(raw.host || raw.remote_ip || ''),
        timestamp: ts,
      });
    }
  }
  return out.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}
