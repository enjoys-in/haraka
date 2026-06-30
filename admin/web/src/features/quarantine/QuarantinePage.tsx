import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { QuarantineTable } from './components/QuarantineTable';
import { MOCK_QUARANTINE } from './quarantine.mock';

/** Quarantine review: release or delete held spam / virus / policy messages. */
export function QuarantinePage() {
  const messages = MOCK_QUARANTINE;

  return (
    <Page className="gap-4">
      <PageHeader
        title="Quarantine"
        description="Review, release or delete held messages"
      />

      <PageScroll className="space-y-4">
        <QuarantineTable messages={messages} />
      </PageScroll>
    </Page>
  );
}

export default QuarantinePage;
