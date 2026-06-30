// SMTP domain: top-level keys of config/smtp.ini.
import { readIni } from '../../core/files';
import { setIniKey } from '../../core/ini-edit';

export function getSmtp(): Record<string, string> {
  const cfg = readIni('smtp.ini');
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(cfg)) {
    if (typeof v !== 'object') values[k] = String(v);
  }
  return values;
}

export function setSmtp(values: Record<string, unknown>): Record<string, string> {
  for (const [k, v] of Object.entries(values)) {
    if (/[\r\n[\]]/.test(k)) throw new Error(`Invalid key: ${k}`);
    if (/[\r\n]/.test(String(v))) throw new Error(`Invalid value for ${k}`);
    setIniKey('smtp.ini', '', k, String(v));
  }
  return getSmtp();
}
