import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { ServerIdentityCard } from './components/ServerIdentityCard';
import { ConnectionLimitsCard } from './components/ConnectionLimitsCard';
import { ServerControlCard } from './components/ServerControlCard';
import { MOCK_SETTINGS } from './settings.mock';

/** Core server settings: identity, connection limits and process control. */
export function SettingsPage() {
  const settings = MOCK_SETTINGS;

  return (
    <Page className="gap-4">
      <PageHeader title="Server Settings" description="Identity, connection limits and process control" />

      <PageScroll className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <ServerIdentityCard settings={settings} />
          <ServerControlCard />
        </div>
        <ConnectionLimitsCard settings={settings} />
      </PageScroll>
    </Page>
  );
}

export default SettingsPage;
