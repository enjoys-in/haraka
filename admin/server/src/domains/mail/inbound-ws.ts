// Mail-event WebSocket: subscribes to the Redis channel that custom Haraka
// plugins (inbound_notify + bounce_notify) publish to and fans each event out
// to connected browser clients.
import type { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';
import { REDIS_URL, INBOUND_CHANNEL } from '../../config';

const RECENT_MAX = 50;

export function attachInboundWs(server: Server, wsPath = '/ws/inbound'): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });
  const recent: string[] = [];

  server.on('upgrade', (req, socket, head) => {
    if ((req.url || '').split('?')[0] !== wsPath) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  wss.on('connection', (ws: WebSocket) => {
    // replay recent events so a freshly opened client isn't empty
    for (const m of recent) ws.send(m);
  });

  const sub = createClient({ url: REDIS_URL });
  sub.on('error', (e) => console.error('[haraka-admin] inbound redis:', e.message));
  sub
    .connect()
    .then(() =>
      sub.subscribe(INBOUND_CHANNEL, (message) => {
        recent.push(message);
        if (recent.length > RECENT_MAX) recent.shift();
        for (const ws of wss.clients) {
          if (ws.readyState === WebSocket.OPEN) ws.send(message);
        }
      }),
    )
    .then(() => console.log(`[haraka-admin] WS ${wsPath} <- redis ${INBOUND_CHANNEL}`))
    .catch((e) => console.error('[haraka-admin] inbound subscribe failed:', e.message));

  return wss;
}
