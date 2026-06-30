// Quarantine domain: messages held on disk by the quarantine plugin. Default
// location is HARAKA_ROOT/queue/quarantine (the plugin groups files into dated
// / reason subfolders). Read-only: lists held messages parsed from their files.
import fs from 'node:fs';
import path from 'node:path';
import { queueRoots } from '../../config';
import { sendRaw } from '../mail/mail.service';

// Each worker's quarantine lives under its queue root (<queueRoot>/quarantine).
// In multi-root mode a message id is prefixed with the worker key.
interface QuarantineRoot {
  key: string;
  dir: string;
}

function quarantineRoots(): QuarantineRoot[] {
  return queueRoots().map((r) => ({ key: r.key, dir: path.join(r.dir, 'quarantine') }));
}

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
  const messages: QuarantinedMessage[] = [];
  for (const root of quarantineRoots()) {
    const files: string[] = [];
    walk(root.dir, files);
    for (const filePath of files) {
      let stat: fs.Stats;
      try {
        stat = fs.statSync(filePath);
      } catch {
        continue;
      }
      const rel = path.relative(root.dir, filePath);
      const h = headers(filePath);
      messages.push({
        id: root.key ? `${root.key}/${rel}` : rel,
        from: h.from,
        to: h.to,
        subject: h.subject,
        reason: reasonFrom(rel),
        score: null,
        size: stat.size,
        quarantinedAt: stat.mtimeMs,
      });
    }
  }
  return messages.sort((a, b) => b.quarantinedAt - a.quarantinedAt);
}

// An id is the file path RELATIVE to a worker's quarantine root, optionally
// prefixed with `<key>/` to select the worker. Resolve it and confirm it stays
// inside that root (no traversal).
function splitQid(id: string): { key: string; rel: string } {
  const slash = id.indexOf('/');
  if (slash !== -1) {
    const first = id.slice(0, slash);
    if (queueRoots().some((r) => r.key === first)) {
      return { key: first, rel: id.slice(slash + 1) };
    }
  }
  return { key: '', rel: id };
}

function quarantineFilePath(id: string): string {
  const { key, rel } = splitQid(id);
  const base = quarantineRoots().find((r) => r.key === key);
  if (!base) throw new Error('Invalid quarantine id');
  const root = path.resolve(base.dir);
  const filePath = path.resolve(root, rel);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    throw new Error('Invalid quarantine id');
  }
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) throw new Error('Not a quarantine file');
  return filePath;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function headerValue(block: string, name: string): string {
  const re = new RegExp(`^${name}:\\s*(.*(?:\\r?\\n[ \\t].*)*)`, 'im');
  const m = block.match(re);
  return m ? m[1].replace(/\r?\n[ \t]+/g, ' ').trim() : '';
}

/** Re-inject a held message into delivery (via the MSA) and remove it from
 *  quarantine. Envelope is derived from the message's From / To / Cc headers. */
export async function releaseQuarantine(id: string): Promise<{ to: string[] }> {
  const filePath = quarantineFilePath(id);
  const raw = fs.readFileSync(filePath);
  const split = raw.toString('utf8').search(/\r?\n\r?\n/);
  const block = split === -1 ? raw.toString('utf8') : raw.toString('utf8', 0, split);

  const to = Array.from(
    new Set(`${headerValue(block, 'to')} ${headerValue(block, 'cc')}`.match(EMAIL_RE) ?? []),
  );
  if (to.length === 0) throw new Error('Cannot determine a recipient to release this message');

  // Re-inject through the MSA. The envelope MAIL FROM defaults to the
  // authenticated submission user — the worker rejects relay when the envelope
  // domain differs from the AUTH domain. The original From: header stays in the
  // raw message, so the recipient still sees the true sender.
  await sendRaw({ to }, raw);
  fs.unlinkSync(filePath);
  return { to };
}

/** Permanently delete a held message without delivering it. */
export function deleteQuarantine(id: string): void {
  fs.unlinkSync(quarantineFilePath(id));
}
