import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: ReactNode;
  /** Tailwind classes for the icon chip, e.g. "bg-emerald-500/15 text-emerald-500". */
  accent?: string;
  /** Tailwind classes for the card border + gradient, matched to the accent. */
  surface?: string;
  className?: string;
}

/** Compact KPI tile (label, big value, icon chip) used on dashboards. */
export function StatTile({
  label,
  value,
  icon,
  hint,
  accent = 'bg-[#FFA724]/15 text-[#FFA724]',
  surface = 'border-[#FFA724]/20 from-[#FFA724]/10 to-[#FFA724]/5',
  className,
}: StatTileProps) {
  return (
    <Card
      className={cn(
        'group overflow-hidden border bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:shadow-black/5',
        surface,
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {label}
          </span>
          <div
            className={cn(
              'rounded-xl p-1.5 transition-transform duration-300 group-hover:scale-110',
              accent,
            )}
          >
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {hint != null && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
      </CardContent>
    </Card>
  );
}
