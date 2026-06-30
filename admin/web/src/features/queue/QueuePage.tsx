import { RotateCw } from 'lucide-react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { QueueStats } from './components/QueueStats';
import { QueueTable } from './components/QueueTable';
import { MOCK_QUEUE, MOCK_QUEUE_SUMMARY } from './queue.mock';

/** Outbound mail queue: deferred / sending / frozen messages and controls. */
export function QueuePage() {
  const summary = MOCK_QUEUE_SUMMARY;
  const messages = MOCK_QUEUE;

  return (
    <Page className="gap-6">
      <PageHeader
        title="Mail Queue"
        description="Outbound delivery queue — deferred, sending and frozen messages"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            Flush queue
          </Button>
        }
      />

      <PageScroll className="space-y-6">
        <QueueStats summary={summary} />
        <QueueTable messages={messages} />
      </PageScroll>
    </Page>
  );
}

export default QueuePage;
