import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listUsers, createUser, updateUser, removeUser } from './auth.service';

export const authRouter = Router();

authRouter.get('/', (_req, res) => {
  try {
    ok(res, { users: listUsers() });
  } catch (e) {
    fail(res, e);
  }
});

authRouter.post('/', (req, res) => {
  try {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');
    const aliases = Array.isArray(req.body.aliases)
      ? req.body.aliases.map((a: unknown) => String(a || '').trim())
      : [];
    ok(res, { users: createUser(email, password, aliases) });
  } catch (e) {
    fail(res, e);
  }
});

authRouter.put('/:email', (req, res) => {
  try {
    const previousEmail = decodeURIComponent(req.params.email);
    const email = String(req.body.email || '').trim() || previousEmail;
    const password = String(req.body.password || '').trim() || undefined;
    const aliases = Array.isArray(req.body.aliases)
      ? req.body.aliases.map((a: unknown) => String(a || '').trim())
      : undefined;
    ok(res, { users: updateUser(previousEmail, email, password, aliases) });
  } catch (e) {
    fail(res, e);
  }
});

authRouter.delete('/:email', (req, res) => {
  try {
    ok(res, { users: removeUser(decodeURIComponent(req.params.email)) });
  } catch (e) {
    fail(res, e);
  }
});
