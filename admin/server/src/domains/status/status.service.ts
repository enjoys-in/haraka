// Status domain: probe SMTP + spam/AV service ports.
import { checkPort } from '../../core/ports';
import { CONFIG_DIR } from '../../config';

export interface ServiceStatus {
  key: string;
  label: string;
  host: string;
  port: number;
  up: boolean;
}

function envHost(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function envPort(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const TARGETS = [
  {
    key: 'smtp_25',
    label: 'SMTP (25)',
    host: envHost('STATUS_SMTP_HOST', '127.0.0.1'),
    port: envPort('STATUS_SMTP_PORT', 25),
  },
  {
    key: 'submission_587',
    label: 'Submission (587)',
    host: envHost('STATUS_SUBMISSION_HOST', '127.0.0.1'),
    port: envPort('STATUS_SUBMISSION_PORT', 587),
  },
  {
    key: 'spamassassin',
    label: 'SpamAssassin (783)',
    host: envHost('STATUS_SPAMD_HOST', '127.0.0.1'),
    port: envPort('STATUS_SPAMD_PORT', 783),
  },
  {
    key: 'rspamd',
    label: 'rspamd (11333)',
    host: envHost('STATUS_RSPAMD_HOST', '127.0.0.1'),
    port: envPort('STATUS_RSPAMD_PORT', 11333),
  },
  {
    key: 'clamd',
    label: 'ClamAV (3310)',
    host: envHost('STATUS_CLAMD_HOST', '127.0.0.1'),
    port: envPort('STATUS_CLAMD_PORT', 3310),
  },
  {
    key: 'redis',
    label: 'Redis (6379)',
    host: envHost('STATUS_REDIS_HOST', '127.0.0.1'),
    port: envPort('STATUS_REDIS_PORT', 6379),
  },
];

export async function getStatus(): Promise<{ configDir: string; services: ServiceStatus[] }> {
  const services = await Promise.all(
    TARGETS.map(async (t) => ({ ...t, up: await checkPort(t.host, t.port) }))
  );
  return { configDir: CONFIG_DIR, services };
}
