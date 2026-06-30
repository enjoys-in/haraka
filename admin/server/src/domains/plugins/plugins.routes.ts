import { Router } from 'express';
import { ok, fail } from '../../core/http';
import {
  listPlugins,
  setPlugin,
  readPluginConfig,
  writePluginConfig,
  readAccessRules,
  addAccessRule,
  removeAccessRule,
} from './plugins.service';

export const pluginsRouter = Router();

pluginsRouter.get('/', (_req, res) => {
  try {
    ok(res, { plugins: listPlugins() });
  } catch (e) {
    fail(res, e);
  }
});

// access plugin ACLs — registered before the generic "/:name" routes so the
// literal path is never shadowed by the param matcher.
pluginsRouter.get('/access/rules', (_req, res) => {
  try {
    ok(res, readAccessRules());
  } catch (e) {
    fail(res, e);
  }
});

pluginsRouter.post('/access/rules', (req, res) => {
  try {
    const { scope, action, pattern } = req.body ?? {};
    ok(res, addAccessRule(scope, action, pattern));
  } catch (e) {
    fail(res, e);
  }
});

pluginsRouter.post('/access/rules/remove', (req, res) => {
  try {
    const { scope, action, pattern } = req.body ?? {};
    ok(res, removeAccessRule(scope, action, pattern));
  } catch (e) {
    fail(res, e);
  }
});

pluginsRouter.get('/:name/config', (req, res) => {
  try {
    ok(res, { config: readPluginConfig(req.params.name) });
  } catch (e) {
    fail(res, e);
  }
});

pluginsRouter.put('/:name/config', (req, res) => {
  try {
    const content = typeof req.body.content === 'string' ? req.body.content : '';
    ok(res, { config: writePluginConfig(req.params.name, content) });
  } catch (e) {
    fail(res, e);
  }
});

pluginsRouter.post('/:name', (req, res) => {
  try {
    ok(res, { plugins: setPlugin(req.params.name, !!req.body.enabled) });
  } catch (e) {
    fail(res, e);
  }
});
