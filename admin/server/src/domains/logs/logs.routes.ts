import { Router } from 'express';
import { ok, fail } from '../../core/http';
import { listLogs } from './logs.service';
import { readSystemLog, tailSystemLog } from './system-logs.service';

export const logsRouter = Router();

logsRouter.get('/', (req, res) => {
  try {
    const n = Number(req.query.limit || 200);
    const limit = Number.isFinite(n) ? Math.max(1, Math.min(1000, n)) : 200;
    ok(res, { entries: listLogs(limit) });
  } catch (e) {
    fail(res, e, 500);
  }
});

// ── Haraka core/system log (process stdout) ────────────────────────────────
logsRouter.get('/system', (req, res) => {
  try {
    const n = Number(req.query.limit || 300);
    const limit = Number.isFinite(n) ? Math.max(1, Math.min(2000, n)) : 300;
    ok(res, { entries: readSystemLog(limit) });
  } catch (e) {
    fail(res, e, 500);
  }
});

logsRouter.get('/system/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Initial snapshot (newest first), then live tail of newly appended lines.
  res.write(`data: ${JSON.stringify({ entries: readSystemLog(300) })}\n\n`);

  const tailer = tailSystemLog((entries) => {
    for (const entry of entries) {
      res.write(`data: ${JSON.stringify({ entry })}\n\n`);
    }
  });

  // Comment heartbeat keeps idle proxies from dropping the connection.
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);

  req.on('close', () => {
    tailer.stop();
    clearInterval(ping);
  });
});

logsRouter.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let sent = new Set<string>();

  const push = () => {
    const entries = listLogs(200);
    if (sent.size === 0) {
      const snapshot = entries.slice(0, 100);
      for (const e of snapshot) sent.add(e.id);
      res.write(`data: ${JSON.stringify({ entries: snapshot })}\n\n`);
      return;
    }

    const fresh = entries.filter((e) => !sent.has(e.id)).reverse();
    for (const entry of fresh) {
      sent.add(entry.id);
      res.write(`data: ${JSON.stringify({ entry })}\n\n`);
    }

    if (sent.size > 2000) {
      sent = new Set(entries.map((e) => e.id));
    }
  };

  push();
  const timer = setInterval(push, 2000);

  req.on('close', () => {
    clearInterval(timer);
  });
});
