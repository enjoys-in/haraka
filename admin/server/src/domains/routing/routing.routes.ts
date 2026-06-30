import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listRoutes, saveRoute, removeRoute } from './routing.service';

export const routingRouter = Router();

routingRouter.get('/', (_req, res) => {
  try {
    ok(res, { routes: listRoutes() });
  } catch (e) {
    fail(res, e);
  }
});

routingRouter.post('/', (req, res) => {
  try {
    const { domain, host, port, tls } = req.body ?? {};
    ok(res, { routes: saveRoute(domain, host, port, tls) });
  } catch (e) {
    fail(res, e);
  }
});

routingRouter.post('/remove', (req, res) => {
  try {
    ok(res, { routes: removeRoute(req.body?.domain) });
  } catch (e) {
    fail(res, e);
  }
});
