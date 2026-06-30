import { Activity } from 'lucide-react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { LiveStatsGrid } from './components/LiveStatsGrid';
import { ConnectionsTable } from './components/ConnectionsTable';
import { MOCK_CONNECTIONS, MOCK_LIVE_STATS } from './monitoring.mock';

/** Real-time SMTP traffic monitor (inbound/outbound connections, mail sent). */
export function MonitoringPage() {
  const stats = MOCK_LIVE_STATS;
  const connections = MOCK_CONNECTIONS;

  return (
    <Page className="gap-6">
      <PageHeader
        title="Live Monitor"
        description="Real-time inbound & outbound SMTP traffic"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <Activity className="h-3.5 w-3.5" />
            Live
          </span>
        }
      />

      <PageScroll className="space-y-6">
        <LiveStatsGrid stats={stats} />
        <ConnectionsTable connections={connections} />
      </PageScroll>
    </Page>
  );
}

export default MonitoringPage;
