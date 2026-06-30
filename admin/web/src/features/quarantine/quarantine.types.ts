// Quarantine shapes — messages held for review (spam / virus / policy).
// Release / delete actions are wired to the API later.

export type QuarantineReason = 'spam' | 'virus' | 'policy' | 'dmarc';

export interface QuarantinedMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  reason: QuarantineReason;
  /** Spam / threat score, if applicable. */
  score: number | null;
  size: number;
  quarantinedAt: number;
}
