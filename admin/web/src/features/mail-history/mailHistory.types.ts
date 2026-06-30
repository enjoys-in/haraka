// Mail history / delivery log shapes. Wired to a message-log endpoint later.

export type MailDirection = 'inbound' | 'outbound';

export type DeliveryStatus =
  | 'delivered'
  | 'received'
  | 'deferred'
  | 'bounced'
  | 'rejected'
  | 'quarantined';

export interface MailRecord {
  id: string;
  direction: MailDirection;
  from: string;
  to: string;
  subject: string;
  status: DeliveryStatus;
  size: number;
  /** Spam score assigned by rspamd/spamassassin, if scanned. */
  spamScore: number | null;
  remoteHost: string;
  timestamp: number;
}
