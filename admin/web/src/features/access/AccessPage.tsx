import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { AddAccessRuleForm } from './components/AddAccessRuleForm';
import { AccessRuleTable } from './components/AccessRuleTable';
import { MOCK_ACCESS_RULES } from './access.mock';

/** Access control: allow / deny rules for connections, HELO, MAIL and RCPT. */
export function AccessPage() {
  const rules = MOCK_ACCESS_RULES;

  return (
    <Page className="gap-4">
      <PageHeader title="Access Control" description="Allow and deny rules for incoming SMTP" />

      <PageScroll className="space-y-4">
        <AddAccessRuleForm />
        <AccessRuleTable rules={rules} />
      </PageScroll>
    </Page>
  );
}

export default AccessPage;
