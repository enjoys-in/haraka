// Access control (access plugin) shapes — allow / deny lists.
// Persisting rules is wired to the API later.

export type AccessAction = 'allow' | 'deny';

/** SMTP phase a rule applies to. */
export type AccessScope = 'connect' | 'helo' | 'mail' | 'rcpt';

export interface AccessRule {
  id: string;
  scope: AccessScope;
  action: AccessAction;
  /** IP / CIDR / domain / address / regex depending on scope. */
  pattern: string;
  comment: string | null;
  hits: number;
}
