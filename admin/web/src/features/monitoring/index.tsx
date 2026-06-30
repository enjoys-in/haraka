import { lazy, Suspense } from 'react';
import { MonitoringSkeleton } from './MonitoringSkeleton';

const MonitoringPage = lazy(() => import('./MonitoringPage'));

/** Lazy-loaded monitoring route with a skeleton fallback. */
export function MonitoringRoute() {
  return (
    <Suspense fallback={<MonitoringSkeleton />}>
      <MonitoringPage />
    </Suspense>
  );
}
