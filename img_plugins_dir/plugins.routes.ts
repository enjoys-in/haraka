import { Router } from 'express';
import { ok, fail } from '../../core/http';
import {
  listPlugins,
  setPlugin,
  readPluginConfig,
  writePluginConfig,
} from './plugins.service';

export const pluginsRouter = Router();

pluginsRouter.get('/', (_req, res) => {
  try {
    ok(res, { plugins: listPlugins() });
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
