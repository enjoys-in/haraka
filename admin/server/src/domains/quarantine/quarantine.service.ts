// Quarantine domain: messages held on disk by the quarantine plugin. Default
// location is HARAKA_ROOT/queue/quarantine (the plugin groups files into dated
// / reason subfolders). Read-only: lists held messages parsed from their files.
import fs from 'node:fs';
import path from 'node:path';
import { HARAKA_ROOT } from '../../config';

const QUARANTINE_DIR =
  process.env.HARAKA_QUARANTINE_DIR || path.join(HARAKA_ROOT, 'queue', 'quarantine');

export type QuarantineReason = 'spam' | 'virus' | 'policy' | 'dmarc';

export interface QuarantinedMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  reason: QuarantineReason;
  score: number | null;
  size: number;
  quarantinedAt: number;
}

function reasonFrom(relPath: string): QuarantineReason {
  const p = relPath.toLowerCase();
  if (p.includes('virus') || p.includes('clamd') || p.includes('clamav')) return 'virus';
  if (p.includes('spam') || p.includes('rspamd') || p.includes('spamassassin')) return 'spam';
  if (p.includes('dmarc')) return 'dmarc';
  return 'policy';
}

function walk(dir: string, acc: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile()) acc.push(full);
  }
}

function headers(filePath: string): { from: string; to: string; subject: string } {
  let head = '';
  try {
    const fd = fs.openSync(filePath, 'r');
    try {
      const buf = Buffer.alloc(8192);
      const read = fs.readSync(fd, buf, 0, buf.length, 0);
      head = buf.toString('utf8', 0, read);
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return { from: '', to: '', subject: '' };
  }
  const grab = (re: RegExp) => {
    const m = head.match(re);
    return m ? m[1].trim() : '';
  };
  return {
    from: grab(/^from:\s*(.+)$/im),
    to: grab(/^to:\s*(.+)$/im),
    subject: grab(/^subject:\s*(.+)$/im),
  };
}

export function listQuarantine(): QuarantinedMessage[] {
  const files: string[] = [];
  walk(QUARANTINE_DIR, files);
  const messages: QuarantinedMessage[] = [];
  for (const filePath of files) {
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }
    const rel = path.relative(QUARANTINE_DIR, filePath);
    const h = headers(filePath);
    messages.push({
      id: rel,
      from: h.from,
      to: h.to,
      subject: h.subject,
      reason: reasonFrom(rel),
      score: null,
      size: stat.size,
      quarantinedAt: stat.mtimeMs,
    });
  }
  return messages.sort((a, b) => b.quarantinedAt - a.quarantinedAt);
}
