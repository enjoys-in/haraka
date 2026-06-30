import { Router } from 'express';
import { ok, fail } from '../../core/http';
import {
  listTemplates,
  listCustomPlugins,
  readCustomPlugin,
  createCustomPlugin,
  writeCustomPlugin,
  setCustomPluginEnabled,
  removeCustomPlugin,
} from './customPlugins.service';

export const customPluginsRouter = Router();

customPluginsRouter.get('/templates', (_req, res) => {
  try {
    ok(res, { templates: listTemplates() });
  } catch (e) {
    fail(res, e);
  }
});

customPluginsRouter.get('/', (_req, res) => {
  try {
    ok(res, { plugins: listCustomPlugins() });
  } catch (e) {
    fail(res, e);
  }
});

customPluginsRouter.post('/', (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const template = typeof req.body.template === 'string' ? req.body.template : '';
    const enable = !!req.body.enable;
    ok(res, { plugin: createCustomPlugin(name, template, enable) });
  } catch (e) {
    fail(res, e);
  }
});

customPluginsRouter.get('/:name', (req, res) => {
  try {
    ok(res, { plugin: readCustomPlugin(req.params.name) });
  } catch (e) {
    fail(res, e);
  }
});

customPluginsRouter.put('/:name', (req, res) => {
  try {
    const content = typeof req.body.content === 'string' ? req.body.content : '';
    ok(res, { plugin: writeCustomPlugin(req.params.name, content) });
  } catch (e) {
    fail(res, e);
  }
});

customPluginsRouter.post('/:name/enabled', (req, res) => {
  try {
    ok(res, { plugin: setCustomPluginEnabled(req.params.name, !!req.body.enabled) });
  } catch (e) {
    fail(res, e);
  }
});

customPluginsRouter.delete('/:name', (req, res) => {
  try {
    ok(res, { plugins: removeCustomPlugin(req.params.name) });
  } catch (e) {
    fail(res, e);
  }
});
