import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getSmtp, setSmtp } from './smtp.service';

export const smtpRouter = Router();

smtpRouter.get('/', (_req, res) => {
  try {
    ok(res, { values: getSmtp() });
  } catch (e) {
    fail(res, e);
  }
});

smtpRouter.post('/', (req, res) => {
  try {
    ok(res, { values: setSmtp(req.body.values || {}) });
  } catch (e) {
    fail(res, e);
  }
});
