import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getTlsStatus, saveTlsCert, setTlsEnabled } from './tls.service';

export const tlsRouter = Router();

tlsRouter.get('/', (_req, res) => {
  try {
    ok(res, { tls: getTlsStatus() });
  } catch (e) {
    fail(res, e);
  }
});

tlsRouter.post('/cert', (req, res) => {
  try {
    const cert = typeof req.body.cert === 'string' ? req.body.cert : '';
    const key = typeof req.body.key === 'string' ? req.body.key : '';
    ok(res, { tls: saveTlsCert(cert, key) });
  } catch (e) {
    fail(res, e);
  }
});

tlsRouter.post('/enabled', (req, res) => {
  try {
    ok(res, { tls: setTlsEnabled(!!req.body.enabled) });
  } catch (e) {
    fail(res, e);
  }
});
