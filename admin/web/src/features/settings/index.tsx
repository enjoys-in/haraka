import { lazy, Suspense } from 'react';
import { SettingsSkeleton } from './SettingsSkeleton';

const SettingsPage = lazy(() => import('./SettingsPage'));

/** Lazy-loaded server settings route with a skeleton fallback. */
export function SettingsRoute() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPage />
    </Suspense>
  );
}
