import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { sendMail } from './mail.service';

export const mailRouter = Router();

// POST /api/mail/send  { to, from?, subject?, text?, html? }
mailRouter.post('/send', async (req, res) => {
  try {
    ok(res, { result: await sendMail(req.body || {}) });
  } catch (e) {
    fail(res, e);
  }
});
