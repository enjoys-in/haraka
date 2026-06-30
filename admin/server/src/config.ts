// Resolved paths and runtime settings for the admin API.
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

// Redis channel used by inbound_notify/bounce_notify to publish mail events.
export const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const INBOUND_CHANNEL = process.env.INBOUND_CHANNEL || 'haraka:inbound';
export const OUTBOUND_LOG_DIR =
  process.env.OUTBOUND_LOG_DIR || path.join(HARAKA_ROOT, 'outbound', 'logs', 'outbound');

// Outbound submission endpoint used by the send-mail API (the OUTBOUND/587 instance).
// secure=false means STARTTLS on 587 (set true only for implicit-TLS 465).
export const OUTBOUND_SMTP = {
  host: process.env.SMTP_OUT_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_OUT_PORT || 587),
  user: process.env.SMTP_OUT_USER || 'testuser@airsend.in',
  pass: process.env.SMTP_OUT_PASS || 'TestPass123!',
  secure: process.env.SMTP_OUT_SECURE === 'true',
};
