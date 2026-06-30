import { Badge } from '@/components/ui/badge';
import type { QuarantineReason } from '../quarantine.types';

const REASON_STYLES: Record<QuarantineReason, { label: string; className: string }> = {
  spam: { label: 'Spam', className: 'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  virus: { label: 'Virus', className: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400' },
  policy: { label: 'Policy', className: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  dmarc: { label: 'DMARC', className: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400' },
};

/** Colored pill for why a message was quarantined. */
export function QuarantineReasonBadge({ reason }: { reason: QuarantineReason }) {
  const style = REASON_STYLES[reason];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${style.className}`}>
      {style.label}
    </Badge>
  );
}
