import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getStatus } from './status.service';

export const statusRouter = Router();

statusRouter.get('/', async (_req, res) => {
  try {
    ok(res, await getStatus());
  } catch (e) {
    fail(res, e, 500);
  }
});
