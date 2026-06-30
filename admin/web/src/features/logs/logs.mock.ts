import type { LogEntry } from './logs.types';

// Placeholder log lines; replace with the live log tail endpoint.
export const MOCK_LOGS: LogEntry[] = [
  {
    id: 'l1',
    timestamp: Date.now() - 1000,
    level: 'info',
    plugin: 'connect.p0f',
    connectionId: 'C7F2',
    message: 'connect ip=203.0.113.42 port=51344',
  },
  {
    id: 'l2',
    timestamp: Date.now() - 2400,
    level: 'notice',
    plugin: 'rcpt_to.in_host_list',
    connectionId: 'C7F2',
    message: 'recipient accepted user@cirrusmail.cloud',
  },
  {
    id: 'l3',
    timestamp: Date.now() - 3100,
    level: 'warn',
    plugin: 'data.headers',
    connectionId: 'C7F2',
    message: 'missing Message-ID header, generating one',
  },
  {
    id: 'l4',
    timestamp: Date.now() - 5200,
    level: 'error',
    plugin: 'queue.smtp_forward',
    connectionId: 'C801',
    message: 'connection to 142.250.80.27:25 timed out',
  },
  {
    id: 'l5',
    timestamp: Date.now() - 6900,
    level: 'info',
    plugin: 'rspamd',
    connectionId: 'C7F2',
    message: 'score=1.4 action=no action symbols=DKIM_VALID,SPF_PASS',
  },
  {
    id: 'l6',
    timestamp: Date.now() - 8800,
    level: 'crit',
    plugin: null,
    connectionId: null,
    message: 'worker 18360 exceeded memory soft limit, recycling',
  },
  {
    id: 'l7',
    timestamp: Date.now() - 10400,
    level: 'debug',
    plugin: 'tls',
    connectionId: 'C802',
    message: 'TLS established protocol=TLSv1.3 cipher=TLS_AES_256_GCM_SHA384',
  },
];
