import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { ServerIdentityCard } from './components/ServerIdentityCard';
import { ConnectionLimitsCard } from './components/ConnectionLimitsCard';
import { useSettings } from './useSettings';

/** Core server settings: identity and connection limits (real config files). */
export function SettingsPage() {
  const { settings, loading, busy, error, save } = useSettings();

  return (
    <Page className="gap-4">
      <PageHeader title="Server Settings" description="Identity and message/connection limits" />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : loading || !settings ? (
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        ) : (
          <>
            <ServerIdentityCard settings={settings} busy={busy} onSave={save} />
            <ConnectionLimitsCard settings={settings} busy={busy} onSave={save} />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default SettingsPage;
