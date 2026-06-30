import type { TransportRoute } from './routing.types';

// Placeholder routing rules; replace with transport.ini contents.
export const MOCK_ROUTES: TransportRoute[] = [
  {
    id: 'r1',
    domain: '*',
    host: 'direct (MX lookup)',
    port: 25,
    auth: false,
    tls: true,
    isDefault: true,
  },
  {
    id: 'r2',
    domain: 'partner.net',
    host: 'relay.partner.net',
    port: 587,
    auth: true,
    tls: true,
    isDefault: false,
  },
  {
    id: 'r3',
    domain: 'internal.lan',
    host: '127.0.0.1',
    port: 24,
    auth: false,
    tls: false,
    isDefault: false,
  },
];
