// Outbound routing (transport.ini / smtp_forward) shapes.
// Persisting routes is wired to the API later.

export type RouteType = 'mx' | 'smarthost' | 'lmtp';

export interface TransportRoute {
  id: string;
  /** Recipient domain, or "*" for the default route. */
  domain: string;
  type: RouteType;
  host: string;
  port: number;
  auth: boolean;
  tls: boolean;
  /** Lower number = higher priority. */
  priority: number;
}
