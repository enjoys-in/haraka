import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listUsers, upsertUser, removeUser } from './auth.service';

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
    ok(res, { users: upsertUser(email, password) });
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
