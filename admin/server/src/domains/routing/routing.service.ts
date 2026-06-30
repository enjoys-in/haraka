// Routing domain: outbound/forward delivery routes in config/smtp_forward.ini.
// The top region (no [section]) is the DEFAULT route ('*'); each [domain]
// section overrides delivery for that recipient domain. Comment-preserving.
import { readIni } from '../../core/files';
import { setIniKey, deleteIniSection } from '../../core/ini-edit';

const FILE = 'smtp_forward.ini';
const DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
const HOST_RE = /^[a-z0-9.:_-]+$/i;

export interface TransportRoute {
  id: string;
  /** Recipient domain, or "*" for the default route. */
  domain: string;
  host: string;
  port: number;
  tls: boolean;
  /** Whether the route authenticates to the next hop (auth_user is set). */
  auth: boolean;
  /** The default route ('*') is the fallback and cannot be removed. */
  isDefault: boolean;
}

function toBool(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

function routeFrom(domain: string, cfg: Record<string, unknown>, isDefault: boolean): TransportRoute {
  return {
    id: isDefault ? '*' : domain,
    domain: isDefault ? '*' : domain,
    host: typeof cfg.host === 'string' ? cfg.host : '',
    port: Number(cfg.port) || 25,
    tls: toBool(cfg.enable_tls),
    auth: typeof cfg.auth_user === 'string' && cfg.auth_user.length > 0,
    isDefault,
  };
}

export function listRoutes(): TransportRoute[] {
  const cfg = readIni(FILE) as Record<string, unknown>;
  const top: Record<string, unknown> = {};
  const sections: [string, Record<string, unknown>][] = [];

  for (const [key, value] of Object.entries(cfg)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sections.push([key, value as Record<string, unknown>]);
    } else {
      top[key] = value;
    }
  }

  const routes: TransportRoute[] = [];
  // Only surface the default route when a forward host is actually configured.
  if (typeof top.host === 'string' && top.host.length > 0) {
    routes.push(routeFrom('*', top, true));
  }
  for (const [domain, section] of sections) {
    routes.push(routeFrom(domain, section, false));
  }
  return routes;
}

function validateDomain(value: unknown): string {
  const domain = String(value || '').trim().toLowerCase();
  if (domain === '*') return '*';
  if (!DOMAIN_RE.test(domain)) throw new Error(`Invalid domain: ${domain}`);
  return domain;
}

export function saveRoute(
  domain: unknown,
  host: unknown,
  port: unknown,
  tls: unknown = false,
): TransportRoute[] {
  const dom = validateDomain(domain);
  const h = String(host || '').trim();
  if (!HOST_RE.test(h)) throw new Error('Invalid relay host');
  const p = Number(port);
  if (!Number.isInteger(p) || p < 1 || p > 65535) throw new Error('Invalid port');

  const section = dom === '*' ? '' : dom;
  setIniKey(FILE, section, 'host', h);
  setIniKey(FILE, section, 'port', String(p));
  setIniKey(FILE, section, 'enable_tls', toBool(tls) ? 'true' : 'false');
  return listRoutes();
}

export function removeRoute(domain: unknown): TransportRoute[] {
  const dom = validateDomain(domain);
  if (dom === '*') throw new Error('The default route cannot be removed');
  deleteIniSection(FILE, dom);
  return listRoutes();
}
