import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { AddAliasForm } from './components/AddAliasForm';
import { AliasTable } from './components/AliasTable';
import { MOCK_ALIASES } from './aliases.mock';

/** Aliases & forwarding: per-address delivery and catch-all rules. */
export function AliasesPage() {
  const aliases = MOCK_ALIASES;

  return (
    <Page className="gap-4">
      <PageHeader title="Aliases" description="Forwarding, aliases and catch-all rules" />

      <PageScroll className="space-y-4">
        <AddAliasForm />
        <AliasTable aliases={aliases} />
      </PageScroll>
    </Page>
  );
}

export default AliasesPage;
