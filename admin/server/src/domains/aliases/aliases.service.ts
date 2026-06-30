// Aliases domain: address -> delivery rules in config/aliases (haraka-plugin-aliases
// JSON format: { "<address>": { "action": "alias"|"drop"|"continue", "to"?: string|string[] } }).
// The auth domain also writes user-linked aliases into this same file.
import { readRaw, writeRaw } from '../../core/files';

const ALIASES_FILE = 'aliases';
// A key may be a full address (user@domain), a bare local part (user) or a
// domain catch-all (@domain). No whitespace so it can never break the JSON.
const ADDRESS_RE = /^(?:@[^@\s]+\.[^@\s]+|[^@\s]+(?:@[^@\s]+\.[^@\s]+)?)$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type AliasAction = 'alias' | 'drop' | 'continue';

export interface MailAlias {
  id: string;
  address: string;
  destinations: string[];
  action: AliasAction;
}

interface AliasRule {
  action: string;
  to?: string | string[];
}

type AliasMap = Record<string, AliasRule>;

function readAliasMap(): AliasMap {
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

function writeAliasMap(map: AliasMap): void {
  writeRaw(ALIASES_FILE, `${JSON.stringify(map, null, 2)}\n`);
}

function toDestinations(rule: AliasRule): string[] {
  if (typeof rule.to === 'string') return [rule.to];
  if (Array.isArray(rule.to)) return rule.to.filter((v) => typeof v === 'string');
  return [];
}

function normalizeAction(value: unknown): AliasAction {
  return value === 'drop' || value === 'continue' ? value : 'alias';
}

export function listAliases(): MailAlias[] {
  const map = readAliasMap();
  return Object.entries(map)
    .map(([address, rule]) => ({
      id: address,
      address,
      action: normalizeAction(rule?.action),
      destinations: toDestinations(rule || { action: 'alias' }),
    }))
    .sort((a, b) => a.address.localeCompare(b.address));
}

function validateAddress(value: unknown): string {
  const address = String(value || '').trim().toLowerCase();
  if (!address) throw new Error('Address is required');
  if (!ADDRESS_RE.test(address)) throw new Error(`Invalid address: ${address}`);
  return address;
}

function validateDestinations(list: unknown): string[] {
  const arr = Array.isArray(list)
    ? list
    : String(list || '')
        .split(',')
        .map((s) => s.trim());
  const out: string[] = [];
  for (const item of arr) {
    const dest = String(item || '').trim().toLowerCase();
    if (!dest) continue;
    if (!EMAIL_RE.test(dest)) throw new Error(`Invalid destination: ${dest}`);
    if (!out.includes(dest)) out.push(dest);
  }
  return out;
}

export function saveAlias(
  address: unknown,
  destinations: unknown,
  action: unknown = 'alias',
): MailAlias[] {
  const key = validateAddress(address);
  const act = normalizeAction(action);
  const map = readAliasMap();

  if (act === 'drop') {
    map[key] = { action: 'drop' };
  } else {
    const dests = validateDestinations(destinations);
    if (dests.length === 0) throw new Error('At least one destination is required');
    map[key] = { action: act, to: dests.length === 1 ? dests[0] : dests };
  }
  writeAliasMap(map);
  return listAliases();
}

export function removeAlias(address: unknown): MailAlias[] {
  const key = validateAddress(address);
  const map = readAliasMap();
  delete map[key];
  writeAliasMap(map);
  return listAliases();
}
