// Outbound mail queue shapes (Haraka outbound / deferred spool).
// Actions (retry, freeze, delete) are wired to the API later.

export type QueueState = 'queued' | 'sending' | 'deferred' | 'frozen' | 'bounced';

export interface QueuedMessage {
  id: string;
  from: string;
  to: string[];
  subject: string;
  size: number;
  state: QueueState;
  attempts: number;
  /** Epoch millis of the next scheduled delivery attempt, or null. */
  nextRetryAt: number | null;
  lastError: string | null;
  queuedAt: number;
}

export interface QueueSummary {
  total: number;
  deferred: number;
  sending: number;
  frozen: number;
  /** Age of the oldest message still in the queue, in seconds. */
  oldestAgeSeconds: number;
}
