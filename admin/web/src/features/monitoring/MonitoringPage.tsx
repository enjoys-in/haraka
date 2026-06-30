import { Activity } from 'lucide-react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { LiveStatsGrid } from './components/LiveStatsGrid';
import { ServicesTable } from './components/ServicesTable';

/** Live monitor: real service health, queue depth and recent delivery outcomes. */
export function MonitoringPage() {
  const { data, loading, error } = useAsyncData(() => api.monitoring.get(), 5000);

  return (
    <Page className="gap-6">
      <PageHeader
        title="Live Monitor"
        description="Service health, queue depth & recent delivery outcomes"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <Activity className="h-3.5 w-3.5" />
            Live
          </span>
        }
      />

      <PageScroll className="space-y-6">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <LiveStatsGrid snapshot={data} />
            <ServicesTable services={data?.services ?? []} loading={loading} />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default MonitoringPage;
