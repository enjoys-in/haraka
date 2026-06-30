import { useEffect, useRef, useState } from 'react';
import type { InboundEvent } from './types';

interface InboundWsState {
  events: InboundEvent[];
  connected: boolean;
  clear: () => void;
}

// Subscribes to the admin inbound WebSocket (/ws/inbound) and keeps a rolling
// list of the most recent inbound mail events. Auto-reconnects on drop.
export function useInboundWs(max = 100): InboundWsState {
  const [events, setEvents] = useState<InboundEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let stopped = false;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (stopped) return;
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${location.host}/ws/inbound`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!stopped) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data) as InboundEvent;
          setEvents((prev) => [evt, ...prev].slice(0, max));
        } catch {
          /* ignore malformed frames */
        }
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      wsRef.current?.close();
    };
  }, [max]);

  return { events, connected, clear: () => setEvents([]) };
}
