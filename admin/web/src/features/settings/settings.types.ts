// Core server settings shapes (config/me, smtp.ini, connection.ini).
// Saving is wired to the API later.

export interface ServerSettings {
  /** config/me — the server's own hostname. */
  hostname: string;
  /** SMTP greeting banner. */
  greeting: string;
  maxConnections: number;
  maxConnectionsPerHost: number;
  maxMessageSizeMb: number;
  dataTimeoutSec: number;
  tlsRequired: boolean;
}
