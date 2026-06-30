import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Fills the available height inside the app shell so its children — typically a
 * fixed header area plus a {@link PageScroll} region — lay out as a column. Use
 * together with PageScroll so long lists/tables scroll internally instead of
 * scrolling the whole window.
 */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-0 flex-1 flex-col gap-4', className)}>{children}</div>;
}

/** The single scrollable region of a {@link Page}. Everything outside it stays
 *  pinned (search boxes, add forms, primary actions). */
export function PageScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-0 flex-1 space-y-4 overflow-y-auto pb-1 pr-0.5', className)}>
      {children}
    </div>
  );
}
