import { lazy, Suspense } from 'react';
import { LogsSkeleton } from './LogsSkeleton';

const LogsPage = lazy(() => import('./LogsPage'));

/** Lazy-loaded logs route with a skeleton fallback. */
export function LogsRoute() {
  return (
    <Suspense fallback={<LogsSkeleton />}>
      <LogsPage />
    </Suspense>
  );
}
