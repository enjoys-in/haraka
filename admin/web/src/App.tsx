import { useState } from 'react';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { PluginsPage } from '@/features/plugins/PluginsPage';
import { SmtpPage } from '@/features/smtp/SmtpPage';
import { UsersPage } from '@/features/users/UsersPage';
import { DomainsPage } from '@/features/domains/DomainsPage';
import { DkimPage } from '@/features/dkim/DkimPage';
import { SpamPage } from '@/features/spam/SpamPage';

const PAGES: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  domains: <DomainsPage />,
  users: <UsersPage />,
  smtp: <SmtpPage />,
  plugins: <PluginsPage />,
  dkim: <DkimPage />,
  spam: <SpamPage />,
};

export default function App() {
  const [active, setActive] = useState('dashboard');

  return (
    <>
      <Layout active={active} onNavigate={setActive}>
        {PAGES[active]}
      </Layout>
      <Toaster richColors position="top-right" />
    </>
  );
}
