import type { ServerSettings } from './settings.types';

// Placeholder settings; replace with config/me + smtp.ini + connection.ini values.
export const MOCK_SETTINGS: ServerSettings = {
  hostname: 'mx.cirrusmail.cloud',
  greeting: 'CirrusMail ESMTP ready',
  maxConnections: 100,
  maxConnectionsPerHost: 5,
  maxMessageSizeMb: 25,
  dataTimeoutSec: 300,
  tlsRequired: true,
};
