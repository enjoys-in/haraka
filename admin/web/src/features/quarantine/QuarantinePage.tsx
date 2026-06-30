import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { QuarantineTable } from './components/QuarantineTable';
import { useQuarantine } from './useQuarantine';

/** Quarantine review: held spam / virus / policy messages with release/delete. */
export function QuarantinePage() {
  const { data, loading, error, busyId, release, remove } = useQuarantine();
  const messages = data?.messages ?? [];

  return (
    <Page className="gap-4">
      <PageHeader
        title="Quarantine"
        description="Messages held on disk — release to deliver or delete to discard"
      />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <QuarantineTable
            messages={messages}
            loading={loading}
            onRelease={(id) => void release(id)}
            onRemove={(id) => void remove(id)}
            busyId={busyId}
          />
        )}
      </PageScroll>
    </Page>
  );
}

export default QuarantinePage;
