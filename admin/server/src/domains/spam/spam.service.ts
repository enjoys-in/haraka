// Spam domain: settings for spamassassin / rspamd / clamd plugin .ini files.
import { readIni } from '../../core/files';
import { setIniKey } from '../../core/ini-edit';

export interface SpamSettings {
  spamassassin: { spamd_socket: string; max_size: string; reject_threshold: string };
  rspamd: { host: string; port: string; add_headers: string };
  clamd: { clamd_socket: string };
}

const str = (v: unknown): string => (v == null ? '' : String(v));

export function getSpam(): SpamSettings {
  const sa = readIni('spamassassin.ini');
  const rs = readIni('rspamd.ini');
  const cd = readIni('clamd.ini');
  return {
    spamassassin: {
      spamd_socket: str(sa.spamd_socket),
      max_size: str(sa.max_size),
      reject_threshold: str(sa.reject_threshold),
    },
    rspamd: {
      host: str(rs.host),
      port: str(rs.port),
      add_headers: str(rs.add_headers),
    },
    clamd: { clamd_socket: str(cd.main?.clamd_socket) },
  };
}

export function setSpam(body: Partial<SpamSettings>): SpamSettings {
  const apply = (file: string, section: string, obj?: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (v === '' || v == null) continue;
      if (/[\r\n]/.test(String(v))) throw new Error(`Invalid value for ${k}`);
      setIniKey(file, section, k, String(v));
    }
  };
  apply('spamassassin.ini', '', body.spamassassin);
  apply('rspamd.ini', '', body.rspamd);
  apply('clamd.ini', 'main', body.clamd as Record<string, unknown>);
  return getSpam();
}
