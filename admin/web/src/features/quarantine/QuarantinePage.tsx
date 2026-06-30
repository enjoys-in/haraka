import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { QuarantineTable } from './components/QuarantineTable';

/** Quarantine review: held spam / virus / policy messages (read-only). */
export function QuarantinePage() {
  const { data, loading, error } = useAsyncData(() => api.quarantine.list(), 15000);
  const messages = data?.messages ?? [];

  return (
    <Page className="gap-4">
      <PageHeader title="Quarantine" description="Messages held on disk for review" />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <QuarantineTable messages={messages} loading={loading} />
        )}
      </PageScroll>
    </Page>
  );
}

export default QuarantinePage;
