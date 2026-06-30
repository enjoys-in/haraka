import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { MailHistoryFilters } from './components/MailHistoryFilters';
import { MailHistoryTable } from './components/MailHistoryTable';
import { MOCK_MAIL_HISTORY } from './mailHistory.mock';

/** Mail history with delivery status for sent and received messages. */
export function MailHistoryPage() {
  const records = MOCK_MAIL_HISTORY;

  return (
    <Page className="gap-4">
      <PageHeader title="Mail History" description="Delivery status for sent and received messages" />

      <PageScroll className="space-y-4">
        <MailHistoryFilters />
        <MailHistoryTable records={records} />
      </PageScroll>
    </Page>
  );
}

export default MailHistoryPage;
