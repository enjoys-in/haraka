import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listMailHistory } from './mailHistory.service';

export const mailHistoryRouter = Router();

mailHistoryRouter.get('/', (req, res) => {
  try {
    const n = Number(req.query.limit || 200);
    const limit = Number.isFinite(n) ? Math.max(1, Math.min(1000, n)) : 200;
    ok(res, { records: listMailHistory(limit) });
  } catch (e) {
    fail(res, e);
  }
});
