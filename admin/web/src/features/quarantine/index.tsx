import { lazy, Suspense } from 'react';
import { QuarantineSkeleton } from './QuarantineSkeleton';

const QuarantinePage = lazy(() => import('./QuarantinePage'));

/** Lazy-loaded quarantine route with a skeleton fallback. */
export function QuarantineRoute() {
  return (
    <Suspense fallback={<QuarantineSkeleton />}>
      <QuarantinePage />
    </Suspense>
  );
}
