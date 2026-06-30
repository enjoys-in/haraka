import { lazy, Suspense } from 'react';
import { QueueSkeleton } from './QueueSkeleton';

const QueuePage = lazy(() => import('./QueuePage'));

/** Lazy-loaded mail queue route with a skeleton fallback. */
export function QueueRoute() {
  return (
    <Suspense fallback={<QueueSkeleton />}>
      <QueuePage />
    </Suspense>
  );
}
