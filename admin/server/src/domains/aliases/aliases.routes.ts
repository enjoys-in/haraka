import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listAliases, saveAlias, removeAlias } from './aliases.service';

export const aliasesRouter = Router();

aliasesRouter.get('/', (_req, res) => {
  try {
    ok(res, { aliases: listAliases() });
  } catch (e) {
    fail(res, e);
  }
});

aliasesRouter.post('/', (req, res) => {
  try {
    const { address, destinations, action } = req.body ?? {};
    ok(res, { aliases: saveAlias(address, destinations, action) });
  } catch (e) {
    fail(res, e);
  }
});

aliasesRouter.post('/remove', (req, res) => {
  try {
    ok(res, { aliases: removeAlias(req.body?.address) });
  } catch (e) {
    fail(res, e);
  }
});
