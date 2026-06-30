import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { readQueue } from './queue.service';

export const queueRouter = Router();

queueRouter.get('/', (_req, res) => {
  try {
    ok(res, readQueue());
  } catch (e) {
    fail(res, e);
  }
});
