import { Badge } from '@/components/ui/badge';
import type { DeliveryStatus } from '../mailHistory.types';

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  delivered: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  received: 'border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400',
  deferred: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  bounced: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
  rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  quarantined: 'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

/** Colored pill for a message delivery status. */
export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </Badge>
  );
}
