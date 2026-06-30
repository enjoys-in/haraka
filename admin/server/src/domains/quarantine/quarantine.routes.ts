import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listQuarantine, releaseQuarantine, deleteQuarantine } from './quarantine.service';

export const quarantineRouter = Router();

quarantineRouter.get('/', (_req, res) => {
  try {
    ok(res, { messages: listQuarantine() });
  } catch (e) {
    fail(res, e);
  }
});

quarantineRouter.post('/release', async (req, res) => {
  try {
    const id = String((req.body as { id?: unknown }).id ?? '');
    await releaseQuarantine(id);
    ok(res, { messages: listQuarantine() });
  } catch (e) {
    fail(res, e);
  }
});

quarantineRouter.post('/remove', (req, res) => {
  try {
    const id = String((req.body as { id?: unknown }).id ?? '');
    deleteQuarantine(id);
    ok(res, { messages: listQuarantine() });
  } catch (e) {
    fail(res, e);
  }
});
