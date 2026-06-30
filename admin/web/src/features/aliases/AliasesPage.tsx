import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { AddAliasForm } from './components/AddAliasForm';
import { AliasTable } from './components/AliasTable';
import { useAliases } from './useAliases';

/** Aliases & forwarding: per-address delivery and catch-all rules (config/aliases). */
export function AliasesPage() {
  const { aliases, loading, busy, error, save, remove } = useAliases();

  return (
    <Page className="gap-4">
      <PageHeader title="Aliases" description="Forwarding, aliases and catch-all rules" />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <AddAliasForm onAdd={save} busy={busy} />
            <AliasTable
              aliases={aliases}
              loading={loading}
              busy={busy}
              onRemove={(address) => void remove(address)}
            />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default AliasesPage;
