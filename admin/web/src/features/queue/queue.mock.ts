import type { QueuedMessage, QueueSummary } from './queue.types';

// Placeholder queue data; replace with the outbound spool listing endpoint.
export const MOCK_QUEUE_SUMMARY: QueueSummary = {
  total: 42,
  deferred: 39,
  sending: 3,
  frozen: 1,
  oldestAgeSeconds: 9320,
};

export const MOCK_QUEUE: QueuedMessage[] = [
  {
    id: '1782822902176_4_18360',
    from: 'noreply@cirrusmail.cloud',
    to: ['user@gmail.com'],
    subject: 'Your weekly summary',
    size: 48211,
    state: 'deferred',
    attempts: 3,
    nextRetryAt: Date.now() + 600_000,
    lastError: '451 4.7.1 Greylisted, please try again later',
    queuedAt: Date.now() - 9320_000,
  },
  {
    id: '1782823096348_3_18360',
    from: 'billing@cirrusmail.cloud',
    to: ['accounts@acme.io', 'cfo@acme.io'],
    subject: 'Invoice #20451',
    size: 18240,
    state: 'sending',
    attempts: 1,
    nextRetryAt: null,
    lastError: null,
    queuedAt: Date.now() - 45_000,
  },
  {
    id: '1782823188921_5_18360',
    from: 'alerts@cirrusmail.cloud',
    to: ['ops@partner.net'],
    subject: 'Disk usage warning',
    size: 5120,
    state: 'deferred',
    attempts: 7,
    nextRetryAt: Date.now() + 1_800_000,
    lastError: '421 Service not available, closing transmission channel',
    queuedAt: Date.now() - 18_400_000,
  },
  {
    id: '1782823251004_2_18360',
    from: 'marketing@cirrusmail.cloud',
    to: ['lead@example.com'],
    subject: 'Spring promo',
    size: 91344,
    state: 'frozen',
    attempts: 12,
    nextRetryAt: null,
    lastError: '550 5.1.1 Recipient address rejected: User unknown',
    queuedAt: Date.now() - 86_400_000,
  },
];
