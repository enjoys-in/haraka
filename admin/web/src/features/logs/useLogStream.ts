import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { LogEntry } from '@/lib/types';

/** Which Haraka log stream to subscribe to. */
export type LogSource = 'system' | 'outbound';

const STREAM_URL: Record<LogSource, string> = {
  system: '/api/logs/system/stream',
  outbound: '/api/logs/stream',
};

const MAX_ENTRIES = 1000;

/**
 * Subscribes to a log source: fetches an initial snapshot over REST, then
 * applies live SSE deltas. Returns the current entries (newest first).
 * Re-subscribes whenever `source` changes.
 */
export function useLogStream(source: LogSource): LogEntry[] {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    let closed = false;
    setEntries([]);

    const initial = source === 'system' ? api.logs.systemList(300) : api.logs.list(200);
    initial
      .then((res) => {
        if (!closed) setEntries(res.entries);
      })
      .catch(() => {
        // SSE will populate; keep the page usable even if the snapshot fails.
      });

    const es = new EventSource(STREAM_URL[source]);
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data) as { entries?: LogEntry[]; entry?: LogEntry };
        if (payload.entries) {
          setEntries(payload.entries);
          return;
        }
        if (payload.entry) {
          const entry = payload.entry;
          setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
        }
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      closed = true;
      es.close();
    };
  }, [source]);

  return entries;
}
