import { RotateCw } from 'lucide-react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { QueueStats } from './components/QueueStats';
import { QueueTable } from './components/QueueTable';
import { useQueue } from './useQueue';

const EMPTY_SUMMARY = { total: 0, deferred: 0, sending: 0, frozen: 0, oldestAgeSeconds: 0 };

/** Outbound mail queue: deferred / sending / frozen messages with retry/delete. */
export function QueuePage() {
  const { data, loading, error, reload, busyId, retry, remove } = useQueue();
  const summary = data?.summary ?? EMPTY_SUMMARY;
  const messages = data?.messages ?? [];

  return (
    <Page className="gap-6">
      <PageHeader
        title="Mail Queue"
        description="Outbound delivery queue — retry or remove deferred messages"
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
            <QueueTable
              messages={messages}
              loading={loading}
              onRetry={(id) => void retry(id)}
              onRemove={(id) => void remove(id)}
              busyId={busyId}
            />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default QueuePage;
