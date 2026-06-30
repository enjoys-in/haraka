import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listDomains, addDomain, removeDomain } from './mailDomains.service';

export const mailDomainsRouter = Router();

mailDomainsRouter.get('/', (_req, res) => {
  try {
    ok(res, { domains: listDomains() });
  } catch (e) {
    fail(res, e);
  }
});

mailDomainsRouter.post('/', (req, res) => {
  try {
    ok(res, { domains: addDomain(String(req.body.domain || '')) });
  } catch (e) {
    fail(res, e);
  }
});

mailDomainsRouter.delete('/:domain', (req, res) => {
  try {
    ok(res, { domains: removeDomain(decodeURIComponent(req.params.domain)) });
  } catch (e) {
    fail(res, e);
  }
});
