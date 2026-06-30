import { lazy, Suspense } from 'react';
import { RoutingSkeleton } from './RoutingSkeleton';

const RoutingPage = lazy(() => import('./RoutingPage'));

/** Lazy-loaded routing route with a skeleton fallback. */
export function RoutingRoute() {
  return (
    <Suspense fallback={<RoutingSkeleton />}>
      <RoutingPage />
    </Suspense>
  );
}
