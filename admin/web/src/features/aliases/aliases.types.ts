// Alias / forwarding shapes (aliases plugin). Persisting is wired later.

export type AliasType = 'alias' | 'forward' | 'catchall';

export interface MailAlias {
  id: string;
  /** Source address, e.g. "info@cirrusmail.cloud" or "*@cirrusmail.cloud". */
  address: string;
  /** One or more destination addresses. */
  destinations: string[];
  type: AliasType;
  enabled: boolean;
}
