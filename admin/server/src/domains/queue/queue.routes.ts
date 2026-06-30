import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { readQueue, retryQueueItem, deleteQueueItem } from './queue.service';

export const queueRouter = Router();

queueRouter.get('/', (_req, res) => {
  try {
    ok(res, readQueue());
  } catch (e) {
    fail(res, e);
  }
});

queueRouter.post('/retry', (req, res) => {
  try {
    const id = String((req.body as { id?: unknown }).id ?? '');
    retryQueueItem(id);
    ok(res, readQueue());
  } catch (e) {
    fail(res, e);
  }
});

queueRouter.post('/remove', (req, res) => {
  try {
    const id = String((req.body as { id?: unknown }).id ?? '');
    deleteQueueItem(id);
    ok(res, readQueue());
  } catch (e) {
    fail(res, e);
  }
});
