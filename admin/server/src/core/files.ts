// Low-level reads/writes of Haraka config files inside CONFIG_DIR.
import fs from 'node:fs';
import path from 'node:path';
import ini from 'ini';
import { CONFIG_DIR } from '../config';

export function configPath(name: string): string {
  const p = path.join(CONFIG_DIR, name);
  if (!p.startsWith(CONFIG_DIR)) throw new Error('Invalid config path');
  return p;
}

export function readRaw(name: string): string {
  const p = configPath(name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

export function writeRaw(name: string, content: string): void {
  fs.writeFileSync(configPath(name), content);
}

export function readLines(name: string): string[] {
  return readRaw(name).split(/\r?\n/);
}

export function writeLines(name: string, lines: string[]): void {
  writeRaw(name, lines.join('\n'));
}

export function readIni(name: string): Record<string, any> {
  const raw = readRaw(name);
  if (!raw) return {};
  try {
    return ini.parse(raw) as Record<string, any>;
  } catch {
    return {};
  }
}
