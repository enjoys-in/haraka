import { useMemo, useState } from 'react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { LogToolbar } from './components/LogToolbar';
import { LogViewer } from './components/LogViewer';
import { LogSourceToggle } from './components/LogSourceToggle';
import { useLogStream, type LogSource } from './useLogStream';
import { filterLogs, downloadLogsJson } from './logs.utils';
import { LOG_LEVELS, type LogLevel } from './logs.types';

const SOURCE_DESCRIPTION: Record<LogSource, string> = {
  system: 'Live Haraka system log — core, plugins & connections (SSE)',
  outbound: 'Live outbound logger stream — delivery & bounce events (SSE)',
};

/** Live log viewer for the Haraka process (system core log + outbound logger). */
export function LogsPage() {
  const [source, setSource] = useState<LogSource>('system');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | LogLevel>('all');
  const [follow, setFollow] = useState(true);

  const entries = useLogStream(source);
  const shown = useMemo(() => filterLogs(entries, level, query), [entries, level, query]);
  const visible = follow ? shown : shown.slice().reverse();

  return (
    <Page className="gap-4">
      <PageHeader
        title="Logs"
        description={SOURCE_DESCRIPTION[source]}
        actions={<LogSourceToggle value={source} onChange={setSource} />}
      />

      <PageScroll className="space-y-4">
        <LogToolbar
          query={query}
          onQueryChange={setQuery}
          level={level}
          onLevelChange={setLevel}
          levels={LOG_LEVELS}
          follow={follow}
          onFollowChange={setFollow}
          onExport={() => downloadLogsJson(shown, `haraka-${source}-logs.json`)}
        />
        <LogViewer entries={visible} />
      </PageScroll>
    </Page>
  );
}

export default LogsPage;
