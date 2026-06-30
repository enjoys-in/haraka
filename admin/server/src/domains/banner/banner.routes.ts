import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { getBanner, setBanner } from './banner.service';

export const bannerRouter = Router();

bannerRouter.get('/', (_req, res) => {
  try {
    ok(res, { banner: getBanner() });
  } catch (e) {
    fail(res, e);
  }
});

bannerRouter.post('/', (req, res) => {
  try {
    ok(res, { banner: setBanner(req.body || {}) });
  } catch (e) {
    fail(res, e);
  }
});
