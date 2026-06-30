// Auth domain: dynamic SMTP users in config/auth_flat_file.ini [users].
// NOTE: auth/flat_file compares the stored value as plaintext (get_plain_passwd),
// so passwords are stored verbatim. Use TLS in production.
import { readIni } from '../../core/files';
import { setIniKey, deleteIniKey } from '../../core/ini-edit';

const FILE = 'auth_flat_file.ini';

export interface AuthUser {
  email: string;
}

export function listUsers(): AuthUser[] {
  const cfg = readIni(FILE);
  return Object.keys(cfg.users || {}).map((email) => ({ email }));
}

export function upsertUser(email: string, password: string): AuthUser[] {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Invalid email address');
  if (!password || /[\r\n]/.test(password)) throw new Error('Invalid password');
  setIniKey(FILE, 'users', email, password);
  return listUsers();
}

export function removeUser(email: string): AuthUser[] {
  deleteIniKey(FILE, 'users', email);
  return listUsers();
}
