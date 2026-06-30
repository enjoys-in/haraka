import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RouteError } from './RouteError';
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
const MonitoringPage = lazyNamed(
  () => import('@/features/monitoring/MonitoringPage'),
  'MonitoringPage',
);
const AliasesPage = lazyNamed(() => import('@/features/aliases/AliasesPage'), 'AliasesPage');
const RoutingPage = lazyNamed(() => import('@/features/routing/RoutingPage'), 'RoutingPage');
const QueuePage = lazyNamed(() => import('@/features/queue/QueuePage'), 'QueuePage');
const MailHistoryPage = lazyNamed(
  () => import('@/features/mail-history/MailHistoryPage'),
  'MailHistoryPage',
);
const SettingsPage = lazyNamed(() => import('@/features/settings/SettingsPage'), 'SettingsPage');
const QuarantinePage = lazyNamed(
  () => import('@/features/quarantine/QuarantinePage'),
  'QuarantinePage',
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    // Full-page fallback if the Layout shell itself fails to render.
    errorElement: <RouteError />,
    children: [
      {
        // Page/lazy-chunk errors are caught here so the error panel renders
        // inside the app shell (sidebar stays visible).
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Navigate to={PATHS.dashboard} replace /> },
          { path: PATHS.dashboard, element: <Dashboard /> },
          { path: PATHS.logs, element: <LogsPage /> },
          { path: PATHS.monitoring, element: <MonitoringPage /> },
          { path: PATHS.mail, element: <MailPage /> },
          { path: PATHS.mailHistory, element: <MailHistoryPage /> },
          { path: PATHS.domains, element: <DomainsPage /> },
          { path: PATHS.users, element: <UsersPage /> },
          { path: PATHS.aliases, element: <AliasesPage /> },
          { path: PATHS.queue, element: <QueuePage /> },
          { path: PATHS.smtp, element: <SmtpPage /> },
          { path: PATHS.banner, element: <BannerPage /> },
          { path: PATHS.dkim, element: <DkimPage /> },
          { path: PATHS.routing, element: <RoutingPage /> },
          { path: PATHS.settings, element: <SettingsPage /> },
          { path: '/plugins', element: <Navigate to={PATHS.inboundPlugins} replace /> },
          { path: PATHS.inboundPlugins, element: <InboundPluginsPage /> },
          { path: PATHS.outboundPlugins, element: <OutboundPluginsPage /> },
          { path: PATHS.customPlugins, element: <CustomPluginsPage /> },
          { path: PATHS.tls, element: <TlsPage /> },
          { path: PATHS.spam, element: <SpamPage /> },
          { path: PATHS.quarantine, element: <QuarantinePage /> },
          { path: '*', element: <Navigate to={PATHS.dashboard} replace /> },
        ],
      },
    ],
  },
]);
