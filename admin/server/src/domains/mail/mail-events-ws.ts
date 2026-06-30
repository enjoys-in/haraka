// Mail-event WebSockets: each Haraka event class (inbound, outbound, bounce) is
// published to its own Redis channel by the notify plugins. We expose a dedicated
// socket per class and fan each channel out to that socket's browser clients.
import type { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';
import { REDIS_URL, INBOUND_CHANNEL, OUTBOUND_CHANNEL, BOUNCE_CHANNEL } from '../../config';

const RECENT_MAX = 50;

export interface MailEventRoute {
  path: string;
  channel: string;
}

export const MAIL_EVENT_ROUTES: MailEventRoute[] = [
  { path: '/ws/inbound', channel: INBOUND_CHANNEL },
  { path: '/ws/outbound', channel: OUTBOUND_CHANNEL },
  { path: '/ws/bounce', channel: BOUNCE_CHANNEL },
];

// Attach one WebSocketServer per route and a single upgrade router that dispatches
// each incoming socket to the server matching its path.
export function attachMailEventWs(server: Server, routes: MailEventRoute[] = MAIL_EVENT_ROUTES): void {
  const byPath = new Map<string, WebSocketServer>();

  for (const route of routes) {
    const wss = new WebSocketServer({ noServer: true });
    const recent: string[] = [];
    byPath.set(route.path, wss);

    // Replay recent events so a freshly opened client isn't empty.
    wss.on('connection', (ws: WebSocket) => {
      for (const m of recent) ws.send(m);
    });

    const sub = createClient({ url: REDIS_URL });
    sub.on('error', (e) => console.error(`[haraka-admin] ${route.channel} redis:`, e.message));
    sub
      .connect()
      .then(() =>
        sub.subscribe(route.channel, (message) => {
          recent.push(message);
          if (recent.length > RECENT_MAX) recent.shift();
          for (const ws of wss.clients) {
            if (ws.readyState === WebSocket.OPEN) ws.send(message);
          }
        }),
      )
      .then(() => console.log(`[haraka-admin] WS ${route.path} <- redis ${route.channel}`))
      .catch((e) => console.error(`[haraka-admin] ${route.channel} subscribe failed:`, e.message));
  }

  server.on('upgrade', (req, socket, head) => {
    const wsPath = (req.url || '').split('?')[0];
    const wss = byPath.get(wsPath);
    if (!wss) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });
}
