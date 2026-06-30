import type { AccessRule } from './access.types';

// Placeholder ACL rules; replace with access plugin list contents.
export const MOCK_ACCESS_RULES: AccessRule[] = [
  {
    id: 'x1',
    scope: 'connect',
    action: 'deny',
    pattern: '192.0.2.0/24',
    comment: 'Known spam network',
    hits: 1843,
  },
  {
    id: 'x2',
    scope: 'connect',
    action: 'allow',
    pattern: '10.0.0.0/8',
    comment: 'Internal network',
    hits: 52109,
  },
  {
    id: 'x3',
    scope: 'helo',
    action: 'deny',
    pattern: 'localhost',
    comment: 'Forged HELO',
    hits: 712,
  },
  {
    id: 'x4',
    scope: 'mail',
    action: 'deny',
    pattern: '@bad.example',
    comment: null,
    hits: 96,
  },
  {
    id: 'x5',
    scope: 'rcpt',
    action: 'allow',
    pattern: 'postmaster@cirrusmail.cloud',
    comment: 'Always accept postmaster',
    hits: 12,
  },
];
