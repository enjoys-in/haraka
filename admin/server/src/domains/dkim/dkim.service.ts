// DKIM domain: generate signing keys per domain and verify the published DNS
// record. Matches Haraka's haraka-plugin-dkim layout:
//   config/dkim/<domain>/{private, public, selector, dns}
import fs from 'node:fs';
import path from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import { promises as dnsp } from 'node:dns';
import { CONFIG_DIR } from '../../config';

const DKIM_DIR = path.join(CONFIG_DIR, 'dkim');
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const SELECTOR_RE = /^[a-z0-9][a-z0-9._-]*$/i;
const KEY_SIZES = [1024, 2048, 4096];

export interface DkimDomain {
  domain: string;
  selector: string;
  hasPrivateKey: boolean;
  dnsName: string;
  dnsValue: string;
}

export interface DkimDetail {
  dkim: DkimDomain;
  publicKey: string;
  instructions: string;
}

export interface DkimVerifyResult {
  domain: string;
  host: string;
  found: boolean;
  match: boolean;
  published: string;
  expected: string;
  message: string;
}

function domainDir(domain: string): string {
  if (!DOMAIN_RE.test(domain)) throw new Error('Invalid domain');
  const dir = path.join(DKIM_DIR, domain);
  if (dir !== DKIM_DIR && !dir.startsWith(DKIM_DIR + path.sep)) {
    throw new Error('Invalid domain path');
  }
  return dir;
}

function defaultSelector(): string {
  const d = new Date();
  const mon = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  return `${mon}${d.getFullYear()}`;
}

// Strip PEM armor + newlines to get the base64 used in the DNS p= tag.
function pemToTag(pem: string): string {
  return pem
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('-----'))
    .join('');
}

function readDomain(domain: string): DkimDomain | null {
  const dir = path.join(DKIM_DIR, domain);
  const selPath = path.join(dir, 'selector');
  if (!fs.existsSync(selPath)) return null;
  const selector = fs.readFileSync(selPath, 'utf8').trim();
  const pubPath = path.join(dir, 'public');
  const pub = fs.existsSync(pubPath) ? fs.readFileSync(pubPath, 'utf8') : '';
  const p = pub ? pemToTag(pub) : '';
  return {
    domain,
    selector,
    hasPrivateKey: fs.existsSync(path.join(dir, 'private')),
    dnsName: `${selector}._domainkey.${domain}`,
    dnsValue: p ? `v=DKIM1;k=rsa;p=${p}` : '',
  };
}

function buildInstructions(domain: string, selector: string, publicPem: string): string {
  const dnsName = `${selector}._domainkey`;
  const dnsValue = `v=DKIM1;k=rsa;p=${pemToTag(publicPem)}`;
  const folded = (dnsValue.match(/.{1,110}/g) || [])
    .map((s) => `        "${s}"`)
    .join('\n');
  return `Add this TXT record to the ${domain} DNS zone.

${dnsName}    IN   TXT   ${dnsValue}


BIND zone file formatted:

${dnsName}    IN   TXT (
${folded}
        )

With SPF:

        TXT "v=spf1 mx a -all"

With DMARC:

_dmarc  TXT "v=DMARC1; p=reject; adkim=s; aspf=r; rua=mailto:dmarc-feedback@${domain}; pct=100"
`;
}

export function listDkim(): DkimDomain[] {
  if (!fs.existsSync(DKIM_DIR)) return [];
  return fs
    .readdirSync(DKIM_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => readDomain(e.name))
    .filter((d): d is DkimDomain => d !== null);
}

export function getDkim(domain: string): DkimDetail {
  const info = readDomain(domain);
  if (!info) throw new Error('No DKIM key for this domain');
  const dir = path.join(DKIM_DIR, domain);
  const read = (f: string) =>
    fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '';
  return { dkim: info, publicKey: read('public'), instructions: read('dns') };
}

export function generateDkim(domain: string, selector?: string, keySize = 2048): DkimDetail {
  const dir = domainDir(domain);
  const sel = (selector || '').trim() || defaultSelector();
  if (!SELECTOR_RE.test(sel)) throw new Error('Invalid selector');
  if (!KEY_SIZES.includes(keySize)) throw new Error('Key size must be 1024, 2048 or 4096');

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'private'), privateKey, { mode: 0o400 });
  fs.writeFileSync(path.join(dir, 'public'), publicKey);
  fs.writeFileSync(path.join(dir, 'selector'), `${sel}\n`);
  fs.writeFileSync(path.join(dir, 'dns'), buildInstructions(domain, sel, publicKey));
  return getDkim(domain);
}

export function removeDkim(domain: string): DkimDomain[] {
  const dir = domainDir(domain);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  return listDkim();
}

export async function verifyDkim(domain: string): Promise<DkimVerifyResult> {
  const info = readDomain(domain);
  if (!info) throw new Error('No DKIM key for this domain');
  const host = info.dnsName;
  const expected = info.dnsValue;
  const localP = expected.match(/p=([A-Za-z0-9+/=]+)/)?.[1] || '';

  let txt: string[][];
  try {
    txt = await dnsp.resolveTxt(host);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    const message =
      code === 'ENOTFOUND' || code === 'ENODATA'
        ? 'No TXT record found in DNS yet'
        : `DNS lookup failed: ${code || (e as Error).message}`;
    return { domain, host, found: false, match: false, published: '', expected, message };
  }

  const records = txt.map((chunks) => chunks.join(''));
  const record = records.find((r) => /(^|;|\s)p=/.test(r) || r.includes('DKIM1')) || records[0] || '';
  const publishedP = record.match(/p=([A-Za-z0-9+/=]+)/)?.[1] || '';
  const match = !!publishedP && publishedP === localP;
  const message = match
    ? 'Published DNS record matches the local public key'
    : publishedP
      ? 'Published key does NOT match the local key (DNS may be stale)'
      : 'TXT record found but it has no p= tag';
  return { domain, host, found: true, match, published: record, expected, message };
}
