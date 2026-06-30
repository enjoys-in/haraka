import { useMemo, useState } from 'react';
import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { MailDirection } from '@/lib/types';
import { MailHistoryFilters } from './components/MailHistoryFilters';
import { MailHistoryTable } from './components/MailHistoryTable';

export type DirectionFilter = 'all' | MailDirection;

/** Mail history with delivery status, derived from outbound delivery logs. */
export function MailHistoryPage() {
  const { data, loading, error } = useAsyncData(() => api.mailHistory.list(500), 10000);
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<DirectionFilter>('all');

  const records = useMemo(() => {
    const all = data?.records ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((r) => {
      if (direction !== 'all' && r.direction !== direction) return false;
      if (!q) return true;
      return (
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q)
      );
    });
  }, [data, query, direction]);

  return (
    <Page className="gap-4">
      <PageHeader title="Mail History" description="Delivery status for sent and received messages" />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <MailHistoryFilters
              query={query}
              direction={direction}
              onQueryChange={setQuery}
              onDirectionChange={setDirection}
            />
            <MailHistoryTable records={records} loading={loading} />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default MailHistoryPage;
