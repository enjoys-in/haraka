import type { ServerSettings } from './settings.types';

// Placeholder settings; replace with config/me + smtp.ini + connection.ini values.
export const MOCK_SETTINGS: ServerSettings = {
  hostname: 'mx.cirrusmail.cloud',
  helo: 'mx.cirrusmail.cloud',
  maxMessageSizeMb: 25,
  inactivityTimeoutSec: 300,
};
