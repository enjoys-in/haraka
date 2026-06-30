// Auth domain: dynamic SMTP users in config/auth_flat_file.ini [users].
// NOTE: auth/flat_file compares the stored value as plaintext (get_plain_passwd),
// so passwords are stored verbatim. Use TLS in production.
import { readIni, readRaw, writeRaw } from '../../core/files';
import { setIniKey, deleteIniKey } from '../../core/ini-edit';

const FILE = 'auth_flat_file.ini';
const ALIASES_FILE = 'aliases';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface AliasRule {
  action: string;
  to?: string | string[];
}

type AliasMap = Record<string, AliasRule>;

export interface AuthUser {
  email: string;
  aliases: string[];
}

export function listUsers(): AuthUser[] {
  const cfg = readIni(FILE);
  const aliases = readAliases();
  return Object.keys(cfg.users || {}).map((email) => {
    const normalized = normalizeEmail(email);
    return { email: normalized, aliases: listAliasesForTarget(aliases, normalized) };
  });
}

export function createUser(email: string, password: string, aliases: string[] = []): AuthUser[] {
  const target = normalizeAndValidateEmail(email);
  if (!password || /[\r\n]/.test(password)) throw new Error('Invalid password');
  setIniKey(FILE, 'users', target, password);
  const aliasMap = readAliases();
  applyAliases(aliasMap, target, aliases);
  writeAliases(aliasMap);
  return listUsers();
}

export function updateUser(
  previousEmail: string,
  email: string,
  password?: string,
  aliases?: string[]
): AuthUser[] {
  const current = normalizeAndValidateEmail(previousEmail);
  const next = normalizeAndValidateEmail(email);
  const cfg = readIni(FILE);
  const users = (cfg.users || {}) as Record<string, string>;
  const stored = users[current];
  if (!stored) throw new Error(`User not found: ${current}`);

  const resolvedPassword = password && !/[\r\n]/.test(password) ? password : stored;
  if (!resolvedPassword) throw new Error('Password is required');

  if (current !== next) deleteIniKey(FILE, 'users', current);
  setIniKey(FILE, 'users', next, resolvedPassword);

  const aliasMap = readAliases();
  const nextAliases = aliases ?? listAliasesForTarget(aliasMap, current);
  if (current !== next) {
    removeAliasesForTarget(aliasMap, current);
  }
  applyAliases(aliasMap, next, nextAliases);
  writeAliases(aliasMap);

  return listUsers();
}

export function removeUser(email: string): AuthUser[] {
  const target = normalizeAndValidateEmail(email);
  deleteIniKey(FILE, 'users', target);
  const aliasMap = readAliases();
  removeAliasesForTarget(aliasMap, target);
  writeAliases(aliasMap);
  return listUsers();
}

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

function normalizeAndValidateEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (!EMAIL_RE.test(normalized)) throw new Error('Invalid email address');
  return normalized;
}

function normalizeAliases(target: string, aliases: string[]): string[] {
  const seen = new Set<string>();
  for (const alias of aliases || []) {
    const normalized = normalizeAndValidateEmail(alias);
    if (normalized !== target) seen.add(normalized);
  }
  return [...seen].sort();
}

function readAliases(): AliasMap {
  const raw = readRaw(ALIASES_FILE).trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('aliases must be a JSON object');
    }
    return parsed as AliasMap;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid aliases file';
    throw new Error(`Invalid aliases config: ${msg}`);
  }
}

function writeAliases(aliases: AliasMap): void {
  writeRaw(ALIASES_FILE, `${JSON.stringify(aliases, null, 2)}\n`);
}

function hasTarget(rule: AliasRule | undefined, target: string): boolean {
  if (!rule || rule.action !== 'alias') return false;
  if (typeof rule.to === 'string') return normalizeEmail(rule.to) === target;
  if (Array.isArray(rule.to)) return rule.to.some((v) => normalizeEmail(v) === target);
  return false;
}

function listAliasesForTarget(aliases: AliasMap, target: string): string[] {
  return Object.entries(aliases)
    .filter(([key, rule]) => EMAIL_RE.test(key) && hasTarget(rule, target))
    .map(([key]) => normalizeEmail(key))
    .sort();
}

function removeAliasesForTarget(aliases: AliasMap, target: string): void {
  for (const [key, rule] of Object.entries(aliases)) {
    if (EMAIL_RE.test(key) && hasTarget(rule, target)) {
      delete aliases[key];
    }
  }
}

function applyAliases(aliases: AliasMap, target: string, list: string[]): void {
  removeAliasesForTarget(aliases, target);
  for (const alias of normalizeAliases(target, list)) {
    aliases[alias] = { action: 'alias', to: target };
  }
}
