// Resolved paths and runtime settings for the admin API.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// src -> admin/server -> admin -> haraka root. Override config dir with env.
export const HARAKA_ROOT = path.resolve(__dirname, '..', '..', '..');
export const CONFIG_DIR =
  process.env.HARAKA_CONFIG_DIR || path.join(HARAKA_ROOT, 'config');
export const PORT = Number(process.env.PORT || 3001);
// Bind host: loopback by default; set HOST=0.0.0.0 to expose (e.g. in Docker).
export const HOST = process.env.HOST || '127.0.0.1';
