// Settings domain: a small set of REAL, editable server settings sourced from
// the actual Haraka config files (no invented keys):
//   hostname            -> config/me
//   helo                -> config/connection.ini [message] helo
//   maxMessageSizeMb    -> config/connection.ini [max] bytes
//   inactivityTimeoutSec-> config/smtp.ini inactivity_timeout (top region)
import { readIni, readRaw, writeRaw } from '../../core/files';
import { setIniKey } from '../../core/ini-edit';

const ME = 'me';
const CONNECTION = 'connection.ini';
const SMTP = 'smtp.ini';
const HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

export interface ServerSettings {
  hostname: string;
  helo: string;
  maxMessageSizeMb: number;
  inactivityTimeoutSec: number;
}

function section(name: string, key: string): Record<string, unknown> {
  const cfg = readIni(name) as Record<string, unknown>;
  const sec = cfg[key];
  return sec && typeof sec === 'object' ? (sec as Record<string, unknown>) : {};
}

export function getSettings(): ServerSettings {
  const message = section(CONNECTION, 'message');
  const max = section(CONNECTION, 'max');
  const smtp = readIni(SMTP) as Record<string, unknown>;

  const bytes = Number(max.bytes) || 26214400;
  const timeout = Number(smtp.inactivity_timeout) || 300;

  return {
    hostname: readRaw(ME).trim(),
    helo: typeof message.helo === 'string' ? message.helo : '',
    maxMessageSizeMb: Math.round((bytes / (1024 * 1024)) * 100) / 100,
    inactivityTimeoutSec: timeout,
  };
}

export function saveSettings(input: Record<string, unknown>): ServerSettings {
  if (input.hostname !== undefined) {
    const hostname = String(input.hostname).trim();
    if (!HOSTNAME_RE.test(hostname)) throw new Error('Invalid hostname');
    writeRaw(ME, `${hostname}\n`);
  }

  if (input.helo !== undefined) {
    const helo = String(input.helo).trim();
    if (/[\r\n[\]]/.test(helo)) throw new Error('Invalid HELO banner');
    setIniKey(CONNECTION, 'message', 'helo', helo);
  }

  if (input.maxMessageSizeMb !== undefined) {
    const mb = Number(input.maxMessageSizeMb);
    if (!Number.isFinite(mb) || mb <= 0 || mb > 1024) throw new Error('Invalid message size');
    const bytes = Math.round(mb * 1024 * 1024);
    setIniKey(CONNECTION, 'max', 'bytes', String(bytes));
  }

  if (input.inactivityTimeoutSec !== undefined) {
    const sec = Number(input.inactivityTimeoutSec);
    if (!Number.isInteger(sec) || sec < 1 || sec > 86400) throw new Error('Invalid timeout');
    setIniKey(SMTP, '', 'inactivity_timeout', String(sec));
  }

  return getSettings();
}
