import { lazy, Suspense } from 'react';
import { AliasesSkeleton } from './AliasesSkeleton';

const AliasesPage = lazy(() => import('./AliasesPage'));

/** Lazy-loaded aliases route with a skeleton fallback. */
export function AliasesRoute() {
  return (
    <Suspense fallback={<AliasesSkeleton />}>
      <AliasesPage />
    </Suspense>
  );
}
