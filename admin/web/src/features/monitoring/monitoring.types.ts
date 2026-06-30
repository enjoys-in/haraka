// Live SMTP traffic shapes — mirrors what Haraka's `watch` plugin surfaces.
// Wiring (WebSocket / polling) is added later by the integration agent.

export type ConnectionDirection = 'inbound' | 'outbound';

export interface LiveStats {
  /** Currently open inbound client connections. */
  inboundActive: number;
  /** Inbound connections accepted since the server started. */
  inboundTotal: number;
  /** Active outbound delivery connections to remote MX hosts. */
  outboundActive: number;
  /** Messages successfully delivered outbound. */
  mailSent: number;
  /** Messages accepted inbound. */
  mailReceived: number;
  /** Messages rejected (policy, spam, auth, etc.). */
  rejected: number;
  /** Messages currently deferred / waiting to retry. */
  deferred: number;
  /** Seconds the MTA process has been running. */
  uptimeSeconds: number;
  /** Recent throughput sample (messages / minute). */
  throughputPerMin: number;
}

export interface LiveConnection {
  id: string;
  direction: ConnectionDirection;
  remoteIp: string;
  remoteHost: string | null;
  helo: string | null;
  mailFrom: string | null;
  rcptCount: number;
  /** Current protocol phase, e.g. "connect", "MAIL", "RCPT", "DATA". */
  state: string;
  tls: boolean;
  bytes: number;
  /** Epoch millis the connection opened. */
  startedAt: number;
}
