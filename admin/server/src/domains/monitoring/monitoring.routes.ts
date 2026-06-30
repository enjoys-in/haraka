import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getMonitoring } from './monitoring.service';

export const monitoringRouter = Router();

monitoringRouter.get('/', async (_req, res) => {
  try {
    ok(res, await getMonitoring());
  } catch (e) {
    fail(res, e);
  }
});
