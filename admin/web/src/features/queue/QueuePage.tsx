import { RotateCw } from 'lucide-react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { QueueStats } from './components/QueueStats';
import { QueueTable } from './components/QueueTable';

const EMPTY_SUMMARY = { total: 0, deferred: 0, sending: 0, frozen: 0, oldestAgeSeconds: 0 };

/** Outbound mail queue: deferred / sending / frozen messages (read-only). */
export function QueuePage() {
  const { data, loading, error, reload } = useAsyncData(() => api.queue.get(), 5000);
  const summary = data?.summary ?? EMPTY_SUMMARY;
  const messages = data?.messages ?? [];

  return (
    <Page className="gap-6">
      <PageHeader
        title="Mail Queue"
        description="Outbound delivery queue — deferred, sending and frozen messages"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void reload()}
            disabled={loading}
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      <PageScroll className="space-y-6">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <QueueStats summary={summary} />
            <QueueTable messages={messages} loading={loading} />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default QueuePage;
