import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getSpam, setSpam } from './spam.service';

export const spamRouter = Router();

spamRouter.get('/', (_req, res) => {
  try {
    ok(res, { settings: getSpam() });
  } catch (e) {
    fail(res, e);
  }
});

spamRouter.post('/', (req, res) => {
  try {
    ok(res, { settings: setSpam(req.body || {}) });
  } catch (e) {
    fail(res, e);
  }
});
