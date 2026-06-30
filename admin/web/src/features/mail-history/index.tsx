import { lazy, Suspense } from 'react';
import { MailHistorySkeleton } from './MailHistorySkeleton';

const MailHistoryPage = lazy(() => import('./MailHistoryPage'));

/** Lazy-loaded mail history route with a skeleton fallback. */
export function MailHistoryRoute() {
  return (
    <Suspense fallback={<MailHistorySkeleton />}>
      <MailHistoryPage />
    </Suspense>
  );
}
