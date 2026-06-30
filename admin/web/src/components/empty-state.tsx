import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  className?: string;
}

/** Centered placeholder for empty tables / lists. */
export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-4 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="text-muted-foreground/40">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description != null && (
        <p className="text-xs text-muted-foreground/70">{description}</p>
      )}
    </div>
  );
}
