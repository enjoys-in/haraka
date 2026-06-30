// TLS domain: install/inspect the STARTTLS certificate + key referenced by
// config/tls.ini, and toggle the `tls` plugin. The cert/key file names always
// come from tls.ini (validated, no path traversal), so the UI can never write
// to an arbitrary location.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { readIni, writeRaw, configPath } from '../../core/files';
import { setPlugin, readPlugins } from '../plugins/plugins.service';

const DEFAULT_CERT = 'tls_cert.pem';
const DEFAULT_KEY = 'tls_key.pem';
// Simple filenames inside CONFIG_DIR only — no slashes, dots-dots or newlines.
const SAFE_FILE = /^[a-zA-Z0-9._-]+$/;

export interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  altNames: string[];
  fingerprint: string;
  serialNumber: string;
  selfSigned: boolean;
  expired: boolean;
}

export interface TlsStatus {
  enabled: boolean;
  certFile: string;
  keyFile: string;
  certExists: boolean;
  keyExists: boolean;
  info: CertInfo | null;
}

function resolveFile(value: unknown, fallback: string): string {
  const name = typeof value === 'string' && value.trim() ? value.trim() : fallback;
  if (!SAFE_FILE.test(name)) throw new Error(`Unsafe TLS file name in tls.ini: ${name}`);
  return name;
}

// tls.ini may list cert/key at the top level or under a [main] section.
function tlsFiles(): { certFile: string; keyFile: string } {
  const cfg = readIni('tls.ini');
  const main = (cfg.main ?? {}) as Record<string, unknown>;
  return {
    certFile: resolveFile(main.cert ?? cfg.cert, DEFAULT_CERT),
    keyFile: resolveFile(main.key ?? cfg.key, DEFAULT_KEY),
  };
}

function parseCert(pem: string): CertInfo {
  const x = new crypto.X509Certificate(pem);
  const validFrom = new Date(x.validFrom);
  const validTo = new Date(x.validTo);
  const now = Date.now();
  const altNames = (x.subjectAltName ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    subject: (x.subject ?? '').replace(/\n/g, ', '),
    issuer: (x.issuer ?? '').replace(/\n/g, ', '),
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    daysRemaining: Math.floor((validTo.getTime() - now) / 86_400_000),
    altNames,
    fingerprint: x.fingerprint256 ?? '',
    serialNumber: x.serialNumber ?? '',
    selfSigned: !!x.subject && x.subject === x.issuer,
    expired: now > validTo.getTime() || now < validFrom.getTime(),
  };
}

export function getTlsStatus(): TlsStatus {
  const { certFile, keyFile } = tlsFiles();
  const certExists = fs.existsSync(configPath(certFile));
  const keyExists = fs.existsSync(configPath(keyFile));
  const enabled = readPlugins().some((p) => p.name === 'tls' && p.enabled);

  let info: CertInfo | null = null;
  if (certExists) {
    try {
      info = parseCert(fs.readFileSync(configPath(certFile), 'utf8'));
    } catch {
      info = null; // unparsable / placeholder cert
    }
  }
  return { enabled, certFile, keyFile, certExists, keyExists, info };
}

export function saveTlsCert(certPem: string, keyPem: string): TlsStatus {
  const cert = (certPem || '').trim();
  const key = (keyPem || '').trim();
  if (!cert) throw new Error('Certificate (PEM) is required');
  if (!key) throw new Error('Private key (PEM) is required');
  if (!/-----BEGIN CERTIFICATE-----/.test(cert))
    throw new Error('Certificate must be PEM-encoded (begins with -----BEGIN CERTIFICATE-----)');
  if (!/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/.test(key))
    throw new Error('Private key must be PEM-encoded (begins with -----BEGIN PRIVATE KEY-----)');

  let x: crypto.X509Certificate;
  try {
    x = new crypto.X509Certificate(cert);
  } catch (e) {
    throw new Error(`Invalid certificate: ${(e as Error).message}`);
  }

  let keyObj: crypto.KeyObject;
  try {
    keyObj = crypto.createPrivateKey(key);
  } catch (e) {
    throw new Error(`Invalid private key: ${(e as Error).message}`);
  }

  // Ensure the key matches the certificate where the runtime supports the check.
  let matches: boolean | null = null;
  try {
    matches = x.checkPrivateKey(keyObj);
  } catch {
    matches = null;
  }
  if (matches === false) throw new Error('The private key does not match the certificate');

  const { certFile, keyFile } = tlsFiles();
  writeRaw(certFile, cert.endsWith('\n') ? cert : `${cert}\n`);
  writeRaw(keyFile, key.endsWith('\n') ? key : `${key}\n`);
  // Restrict private key permissions where supported (no-op on Windows).
  try {
    fs.chmodSync(configPath(keyFile), 0o600);
  } catch {
    /* ignore */
  }

  return getTlsStatus();
}

export function setTlsEnabled(enabled: boolean): TlsStatus {
  if (enabled) {
    const { certFile, keyFile } = tlsFiles();
    if (!fs.existsSync(configPath(certFile)) || !fs.existsSync(configPath(keyFile))) {
      throw new Error('Install a certificate and private key before enabling TLS');
    }
  }
  setPlugin('tls', enabled);
  return getTlsStatus();
}
