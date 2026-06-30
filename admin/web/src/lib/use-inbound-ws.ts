import { useEffect, useRef, useState } from 'react';
import type { InboundEvent } from './types';

interface InboundWsState {
  events: InboundEvent[];
  connected: boolean;
  clear: () => void;
}

// Each Haraka mail-event class is streamed over its own socket; we merge them
// into one chronological list so the UI shows a unified live feed.
const WS_PATHS = ['/ws/inbound', '/ws/outbound', '/ws/bounce'] as const;

// Subscribes to the inbound, outbound and bounce mail-event WebSockets and keeps a
// rolling, de-duplicated list of recent events. Auto-reconnects each socket on drop.
export function useInboundWs(max = 100): InboundWsState {
  const [events, setEvents] = useState<InboundEvent[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const socketsRef = useRef<WebSocket[]>([]);

  useEffect(() => {
    let stopped = false;
    const retries: Record<string, ReturnType<typeof setTimeout>> = {};

    const add = (evt: InboundEvent) =>
      setEvents((prev) =>
        [evt, ...prev.filter((e) => e.uuid !== evt.uuid)]
          .sort((a, b) => b.ts - a.ts)
          .slice(0, max),
      );

    const connect = (path: string) => {
      if (stopped) return;
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${location.host}${path}`);
      socketsRef.current.push(ws);

      let opened = false;
      ws.onopen = () => {
        opened = true;
        setOpenCount((n) => n + 1);
      };
      ws.onclose = () => {
        if (opened) setOpenCount((n) => Math.max(0, n - 1));
        opened = false;
        if (!stopped) retries[path] = setTimeout(() => connect(path), 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          add(JSON.parse(e.data) as InboundEvent);
        } catch {
          /* ignore malformed frames */
        }
      };
    };

    WS_PATHS.forEach(connect);
    return () => {
      stopped = true;
      Object.values(retries).forEach(clearTimeout);
      socketsRef.current.forEach((ws) => ws.close());
      socketsRef.current = [];
    };
  }, [max]);

  return { events, connected: openCount >= WS_PATHS.length, clear: () => setEvents([]) };
}
