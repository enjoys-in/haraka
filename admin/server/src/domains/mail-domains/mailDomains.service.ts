// Mail-domains domain: dynamic accepted domains in config/host_list
// (used by the rcpt_to.in_host_list plugin to decide which domains to accept).
import { readList, addToList, removeFromList } from '../../core/line-list';

const FILE = 'host_list';
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function listDomains(): string[] {
  return readList(FILE);
}

export function addDomain(domain: string): string[] {
  const d = domain.trim().toLowerCase();
  if (d !== 'localhost' && !DOMAIN_RE.test(d)) throw new Error('Invalid domain');
  return addToList(FILE, d);
}

export function removeDomain(domain: string): string[] {
  return removeFromList(FILE, domain.trim().toLowerCase());
}
