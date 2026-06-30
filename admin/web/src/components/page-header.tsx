import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned controls (buttons, badges, etc.). */
  actions?: ReactNode;
}

/** Standard page heading with gradient title and optional actions slot. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          {title}
        </h1>
        {description != null && (
          <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
