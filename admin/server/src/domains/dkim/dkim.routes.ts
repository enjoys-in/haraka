import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listDkim, getDkim, generateDkim, removeDkim, verifyDkim } from './dkim.service';

export const dkimRouter = Router();

dkimRouter.get('/', (_req, res) => {
  try {
    ok(res, { domains: listDkim() });
  } catch (e) {
    fail(res, e);
  }
});

dkimRouter.get('/:domain', (req, res) => {
  try {
    ok(res, getDkim(decodeURIComponent(req.params.domain)));
  } catch (e) {
    fail(res, e, 404);
  }
});

dkimRouter.post('/', (req, res) => {
  try {
    const domain = String(req.body.domain || '').trim();
    const selector = req.body.selector ? String(req.body.selector) : undefined;
    const keySize = req.body.keySize ? Number(req.body.keySize) : undefined;
    ok(res, generateDkim(domain, selector, keySize));
  } catch (e) {
    fail(res, e);
  }
});

dkimRouter.post('/:domain/verify', async (req, res) => {
  try {
    ok(res, { result: await verifyDkim(decodeURIComponent(req.params.domain)) });
  } catch (e) {
    fail(res, e);
  }
});

dkimRouter.delete('/:domain', (req, res) => {
  try {
    ok(res, { domains: removeDkim(decodeURIComponent(req.params.domain)) });
  } catch (e) {
    fail(res, e);
  }
});
