import { Badge } from '@/components/ui/badge';
import type { QueueState } from '../queue.types';

const STATE_STYLES: Record<QueueState, { label: string; className: string }> = {
  queued: { label: 'queued', className: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  sending: {
    label: 'sending',
    className: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  deferred: {
    label: 'deferred',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  frozen: {
    label: 'frozen',
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
  bounced: {
    label: 'bounced',
    className: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
  },
};

/** Colored pill for an outbound queue message state. */
export function QueueStateBadge({ state }: { state: QueueState }) {
  const style = STATE_STYLES[state];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${style.className}`}>
      {style.label}
    </Badge>
  );
}
