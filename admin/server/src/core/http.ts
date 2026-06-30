// Uniform JSON response helpers.
import type { Response } from 'express';

export function ok(res: Response, data: object = {}): Response {
  return res.json({ ok: true, ...data });
}

export function fail(res: Response, err: unknown, code = 400): Response {
  const error = err instanceof Error ? err.message : String(err);
  return res.status(code).json({ ok: false, error });
}
