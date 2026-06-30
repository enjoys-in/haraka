// Banner / white-label domain: the SMTP 220 greeting clients see on connect.
// Hostname lives in config/me; the greeting text + version-hiding toggles live
// in config/connection.ini ([message] greeting[], [uuid] banner_chars,
// [headers] show_version).
import { readRaw, writeRaw, readIni } from '../../core/files';
import { setIniKey, deleteIniKey } from '../../core/ini-edit';

// RFC 1123 host names: labels of [A-Za-z0-9-], no leading/trailing hyphen.
const HOSTNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,62})(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,62}))*$/;

export interface Banner {
  hostname: string;
  greeting: string;
  bannerChars: number;
  showVersion: boolean;
  preview: string;
}

export interface BannerInput {
  hostname?: string;
  greeting?: string;
  bannerChars?: number;
  showVersion?: boolean;
}

function buildPreview(hostname: string, greeting: string, bannerChars: number): string {
  const tail = greeting || 'Haraka ready';
  let line = `220 ${hostname || 'mail.example.com'} ESMTP ${tail}`;
  if (bannerChars > 0) line += ` (${'a1b2c3d4e5f6'.slice(0, Math.min(bannerChars, 12))})`;
  return line;
}

export function getBanner(): Banner {
  const hostname = readRaw('me').trim();
  const cfg = readIni('connection.ini');
  const message = (cfg.message ?? {}) as Record<string, unknown>;
  const uuid = (cfg.uuid ?? {}) as Record<string, unknown>;
  const headers = (cfg.headers ?? {}) as Record<string, unknown>;

  const g = message.greeting;
  const greeting = Array.isArray(g) ? String(g[0] ?? '') : g != null ? String(g) : '';
  const bannerChars = Number(uuid.banner_chars ?? 0) || 0;
  const showVersion = headers.show_version !== false;

  return {
    hostname,
    greeting,
    bannerChars,
    showVersion,
    preview: buildPreview(hostname, greeting, bannerChars),
  };
}

export function setBanner(input: BannerInput): Banner {
  if (input.hostname !== undefined) {
    const host = input.hostname.trim();
    if (!HOSTNAME_RE.test(host)) throw new Error('Invalid hostname');
    writeRaw('me', `${host}\n`);
  }

  if (input.greeting !== undefined) {
    const greeting = input.greeting.trim();
    if (/[\r\n]/.test(greeting)) throw new Error('Greeting must be a single line');
    if (greeting.length > 200) throw new Error('Greeting too long (max 200 chars)');
    // Haraka requires the array form (greeting[]=...) — it spreads cfg.message.greeting.
    deleteIniKey('connection.ini', 'message', 'greeting[]');
    if (greeting) setIniKey('connection.ini', 'message', 'greeting[]', greeting);
  }

  if (input.bannerChars !== undefined) {
    const n = Math.trunc(input.bannerChars);
    if (!Number.isFinite(n) || n < 0 || n > 40) throw new Error('bannerChars must be 0–40');
    setIniKey('connection.ini', 'uuid', 'banner_chars', String(n));
  }

  if (input.showVersion !== undefined) {
    setIniKey('connection.ini', 'headers', 'show_version', input.showVersion ? 'true' : 'false');
  }

  return getBanner();
}
