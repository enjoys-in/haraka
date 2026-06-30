import { useEffect, useMemo, useState } from 'react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { LogToolbar } from './components/LogToolbar';
import { LogViewer } from './components/LogViewer';
import { api } from '@/lib/api';
import type { LogEntry } from '@/lib/types';
import { LOG_LEVELS, type LogLevel } from './logs.types';

/** Live log viewer for the Haraka process. */
export function LogsPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | LogLevel>('all');
  const [follow, setFollow] = useState(true);

  useEffect(() => {
    let closed = false;
    api.logs
      .list(200)
      .then((res) => {
        if (!closed) setEntries(res.entries);
      })
      .catch(() => {
        // SSE will continue trying; keep page usable even if initial fetch fails.
      });

    const source = new EventSource('/api/logs/stream');
    source.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data) as { entries?: LogEntry[]; entry?: LogEntry };
        if (payload.entries) {
          setEntries(payload.entries);
          return;
        }
        if (payload.entry) {
          setEntries((prev) => [payload.entry as LogEntry, ...prev].slice(0, 500));
        }
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      closed = true;
      source.close();
    };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (level !== 'all' && e.level !== level) return false;
      if (!q) return true;
      return `${e.message} ${e.plugin ?? ''} ${e.connectionId ?? ''}`.toLowerCase().includes(q);
    });
  }, [entries, level, query]);

  function exportLogs() {
    const blob = new Blob([JSON.stringify(shown, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'haraka-logs.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const visible = follow ? shown : shown.slice().reverse();

  return (
    <Page className="gap-4">
      <PageHeader title="Logs" description="Live outbound logger stream (SSE)" />

      <PageScroll className="space-y-4">
        <LogToolbar
          query={query}
          onQueryChange={setQuery}
          level={level}
          onLevelChange={setLevel}
          levels={LOG_LEVELS}
          follow={follow}
          onFollowChange={setFollow}
          onExport={exportLogs}
        />
        <LogViewer entries={visible} />
      </PageScroll>
    </Page>
  );
}

export default LogsPage;
