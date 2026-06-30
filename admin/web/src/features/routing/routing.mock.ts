import type { TransportRoute } from './routing.types';

// Placeholder routing rules; replace with transport.ini contents.
export const MOCK_ROUTES: TransportRoute[] = [
  {
    id: 'r1',
    domain: '*',
    type: 'mx',
    host: 'direct (MX lookup)',
    port: 25,
    auth: false,
    tls: true,
    priority: 100,
  },
  {
    id: 'r2',
    domain: 'partner.net',
    type: 'smarthost',
    host: 'relay.partner.net',
    port: 587,
    auth: true,
    tls: true,
    priority: 10,
  },
  {
    id: 'r3',
    domain: 'internal.lan',
    type: 'lmtp',
    host: '127.0.0.1',
    port: 24,
    auth: false,
    tls: false,
    priority: 5,
  },
];
