import type { QuarantinedMessage } from './quarantine.types';

// Placeholder quarantined messages; replace with the quarantine store contents.
export const MOCK_QUARANTINE: QuarantinedMessage[] = [
  {
    id: 'q1',
    from: 'promo@spammy.example',
    to: 'sales@cirrusmail.cloud',
    subject: 'Limited time offer — act now!!!',
    reason: 'spam',
    score: 9.8,
    size: 4096,
    quarantinedAt: Date.now() - 600_000,
  },
  {
    id: 'q2',
    from: 'invoice@malware.example',
    to: 'accounts@cirrusmail.cloud',
    subject: 'Invoice attached',
    reason: 'virus',
    score: null,
    size: 184320,
    quarantinedAt: Date.now() - 2_400_000,
  },
  {
    id: 'q3',
    from: 'noreply@unaligned.example',
    to: 'team@cirrusmail.cloud',
    subject: 'Account update',
    reason: 'dmarc',
    score: null,
    size: 12880,
    quarantinedAt: Date.now() - 5_400_000,
  },
  {
    id: 'q4',
    from: 'bulk@newsletter.example',
    to: 'info@cirrusmail.cloud',
    subject: 'Your weekly roundup',
    reason: 'policy',
    score: 6.1,
    size: 64210,
    quarantinedAt: Date.now() - 9_800_000,
  },
];
