// Resolved paths and runtime settings for the admin API.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// src -> admin/server -> admin -> haraka root. Override config dir with env.
export const HARAKA_ROOT = path.resolve(__dirname, '..', '..', '..');
export const CONFIG_DIR =
  process.env.HARAKA_CONFIG_DIR || path.join(HARAKA_ROOT, 'config');
// Directory Haraka loads plugin .js files from (HARAKA_ROOT/plugins by default).
export const PLUGINS_DIR =
  process.env.HARAKA_PLUGINS_DIR || path.join(HARAKA_ROOT, 'plugins');
export const PORT = Number(process.env.PORT || 3001);
// Bind host: loopback by default; set HOST=0.0.0.0 to expose (e.g. in Docker).
export const HOST = process.env.HOST || '127.0.0.1';

// Redis channels the notify plugins publish to. Each mail-event class has its own
// channel and is streamed over a dedicated WebSocket by the admin.
export const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const INBOUND_CHANNEL = process.env.INBOUND_CHANNEL || 'haraka:inbound';
export const OUTBOUND_CHANNEL = process.env.OUTBOUND_CHANNEL || 'haraka:outbound';
export const BOUNCE_CHANNEL = process.env.BOUNCE_CHANNEL || 'haraka:bounce';
export const OUTBOUND_LOG_DIR =
  process.env.OUTBOUND_LOG_DIR || path.join(HARAKA_ROOT, 'outbound', 'logs', 'outbound');

// Haraka's core/system log file (stdout redirected here). The admin API tails
// this to stream live system logs to the UI. Override with HARAKA_LOG_FILE.
export const HARAKA_LOG_FILE =
  process.env.HARAKA_LOG_FILE || path.join(HARAKA_ROOT, 'logs', 'haraka.log');

// Outbound submission endpoint used by the send-mail API (the OUTBOUND/587 instance).
// secure=false means STARTTLS on 587 (set true only for implicit-TLS 465).
export const OUTBOUND_SMTP = {
  host: process.env.SMTP_OUT_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_OUT_PORT || 587),
  user: process.env.SMTP_OUT_USER || 'testuser@airsend.in',
  pass: process.env.SMTP_OUT_PASS || 'TestPass123!',
  secure: process.env.SMTP_OUT_SECURE === 'true',
};

// A queue spool the admin can read. In the scaled Docker topology each Haraka
// worker keeps a PRIVATE queue volume; the admin mounts them all under a common
// parent (HARAKA_QUEUE_ROOT) so it can aggregate every worker's spool. Each
// immediate subdirectory is one worker's queue, keyed by the subdir name. When
// no parent is configured, a single unkeyed root (HARAKA_QUEUE_DIR) is used.
export interface QueueRoot {
  key: string;
  dir: string;
}

export function queueRoots(): QueueRoot[] {
  const parent = process.env.HARAKA_QUEUE_ROOT;
  if (parent) {
    try {
      const roots = fs
        .readdirSync(parent, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => ({ key: e.name, dir: path.join(parent, e.name) }))
        .sort((a, b) => a.key.localeCompare(b.key));
      if (roots.length > 0) return roots;
    } catch {
      // Parent missing/unreadable — fall back to the single-root layout.
    }
  }
  return [{ key: '', dir: process.env.HARAKA_QUEUE_DIR || path.join(HARAKA_ROOT, 'queue') }];
}
