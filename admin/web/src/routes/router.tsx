import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { lazyNamed } from './lazy';
import { PATHS } from './paths';

// Every page is code-split into its own chunk and rendered inside the Layout's
// Suspense boundary (which shows <PageSkeleton/> while the chunk loads).
const Dashboard = lazyNamed(() => import('@/features/dashboard/Dashboard'), 'Dashboard');
const LogsPage = lazyNamed(() => import('@/features/logs/LogsPage'), 'LogsPage');
const MailPage = lazyNamed(() => import('@/features/mail/MailPage'), 'MailPage');
const DomainsPage = lazyNamed(() => import('@/features/domains/DomainsPage'), 'DomainsPage');
const UsersPage = lazyNamed(() => import('@/features/users/UsersPage.tsx'), 'UsersPage');
const SmtpPage = lazyNamed(() => import('@/features/smtp/SmtpPage'), 'SmtpPage');
const BannerPage = lazyNamed(() => import('@/features/banner/BannerPage'), 'BannerPage');
const DkimPage = lazyNamed(() => import('@/features/dkim/DkimPage'), 'DkimPage');
const InboundPluginsPage = lazyNamed(
  () => import('@/features/plugins/InboundPluginsPage'),
  'InboundPluginsPage',
);
const OutboundPluginsPage = lazyNamed(
  () => import('@/features/plugins/OutboundPluginsPage'),
  'OutboundPluginsPage',
);
const CustomPluginsPage = lazyNamed(
  () => import('@/features/custom-plugins/CustomPluginsPage'),
  'CustomPluginsPage',
);
const TlsPage = lazyNamed(() => import('@/features/tls/TlsPage'), 'TlsPage');
const SpamPage = lazyNamed(() => import('@/features/spam/SpamPage'), 'SpamPage');

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to={PATHS.dashboard} replace /> },
      { path: PATHS.dashboard, element: <Dashboard /> },
      { path: PATHS.logs, element: <LogsPage /> },
      { path: PATHS.mail, element: <MailPage /> },
      { path: PATHS.domains, element: <DomainsPage /> },
      { path: PATHS.users, element: <UsersPage /> },
      { path: PATHS.smtp, element: <SmtpPage /> },
      { path: PATHS.banner, element: <BannerPage /> },
      { path: PATHS.dkim, element: <DkimPage /> },
      { path: '/plugins', element: <Navigate to={PATHS.inboundPlugins} replace /> },
      { path: PATHS.inboundPlugins, element: <InboundPluginsPage /> },
      { path: PATHS.outboundPlugins, element: <OutboundPluginsPage /> },
      { path: PATHS.customPlugins, element: <CustomPluginsPage /> },
      { path: PATHS.tls, element: <TlsPage /> },
      { path: PATHS.spam, element: <SpamPage /> },
      { path: '*', element: <Navigate to={PATHS.dashboard} replace /> },
    ],
  },
]);
