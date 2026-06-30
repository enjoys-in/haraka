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

const TARGETS = [
  { key: 'smtp_25', label: 'SMTP (25)', host: '127.0.0.1', port: 25 },
  { key: 'submission_587', label: 'Submission (587)', host: '127.0.0.1', port: 587 },
  { key: 'spamassassin', label: 'SpamAssassin (783)', host: '127.0.0.1', port: 783 },
  { key: 'rspamd', label: 'rspamd (11333)', host: '127.0.0.1', port: 11333 },
  { key: 'clamd', label: 'ClamAV (3310)', host: '127.0.0.1', port: 3310 },
  { key: 'redis', label: 'Redis (6379)', host: '127.0.0.1', port: 6379 },
];

export async function getStatus(): Promise<{ configDir: string; services: ServiceStatus[] }> {
  const services = await Promise.all(
    TARGETS.map(async (t) => ({ ...t, up: await checkPort(t.host, t.port) }))
  );
  return { configDir: CONFIG_DIR, services };
}
