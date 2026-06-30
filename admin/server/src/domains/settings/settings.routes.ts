import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getSettings, saveSettings } from './settings.service';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  try {
    ok(res, { settings: getSettings() });
  } catch (e) {
    fail(res, e);
  }
});

settingsRouter.post('/', (req, res) => {
  try {
    ok(res, { settings: saveSettings(req.body ?? {}) });
  } catch (e) {
    fail(res, e);
  }
});
