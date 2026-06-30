import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listQuarantine } from './quarantine.service';

export const quarantineRouter = Router();

quarantineRouter.get('/', (_req, res) => {
  try {
    ok(res, { messages: listQuarantine() });
  } catch (e) {
    fail(res, e);
  }
});
