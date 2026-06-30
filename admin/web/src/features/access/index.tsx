import { lazy, Suspense } from 'react';
import { AccessSkeleton } from './AccessSkeleton';

const AccessPage = lazy(() => import('./AccessPage'));

/** Lazy-loaded access control route with a skeleton fallback. */
export function AccessRoute() {
  return (
    <Suspense fallback={<AccessSkeleton />}>
      <AccessPage />
    </Suspense>
  );
}
