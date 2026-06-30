import type { AuthUser } from '@/lib/types';

/** Form shape backing the create/update user form (react-hook-form). */
export interface UserFormValues {
  /** Local part of the account email (before the @). */
  localPart: string;
  /** Domain the account and all its aliases belong to. */
  domain: string;
  /** Plaintext password; optional (blank = keep current) when editing. */
  password: string;
  /**
   * Aliases as local parts only — the domain is always the selected `domain`,
   * so an alias can only ever be active on the user's own domain. Wrapped in an
   * object because useFieldArray requires an array of objects.
   */
  aliases: AliasField[];
}

export interface AliasField {
  local: string;
}

const LOCAL_PART_RE = /^[a-z0-9._%+-]+$/i;

/** Lower-cased, trimmed `local@domain`, or '' when either part is missing. */
export function makeEmail(localPart: string, domain: string): string {
  const lp = localPart.trim().toLowerCase();
  const dm = domain.trim().toLowerCase();
  if (!lp || !dm) return '';
  return `${lp}@${dm}`;
}

/** Validate a single email local part (the bit before the @). */
export function isValidLocalPart(local: string): boolean {
  return LOCAL_PART_RE.test(local.trim());
}

/** Split an email into [localPart, domain]; domain defaults to ''. */
export function splitEmail(email: string): [string, string] {
  const [local, domain = ''] = email.split('@');
  return [local ?? '', domain];
}

/** Pristine form values, optionally seeded with a default domain. */
export function emptyForm(domain = ''): UserFormValues {
  return { localPart: '', domain, password: '', aliases: [] };
}

/**
 * Build form values for editing an existing user. Aliases are reduced to their
 * local parts and de-duplicated so they re-bind to the user's selected domain.
 */
export function formFromUser(user: AuthUser): UserFormValues {
  const [localPart, domain] = splitEmail(user.email);
  const locals = new Set<string>();
  for (const alias of user.aliases) {
    const [local] = splitEmail(alias);
    if (local) locals.add(local.toLowerCase());
  }
  return {
    localPart,
    domain,
    password: '',
    aliases: [...locals].map((local) => ({ local })),
  };
}

/**
 * Combine the local-part alias fields with the selected domain into the full,
 * de-duplicated alias emails the API stores — never the user's own address.
 */
export function combineAliases(aliases: AliasField[], domain: string, ownEmail: string): string[] {
  const seen = new Set<string>();
  for (const { local } of aliases) {
    const email = makeEmail(local, domain);
    if (email && email !== ownEmail) seen.add(email);
  }
  return [...seen];
}
