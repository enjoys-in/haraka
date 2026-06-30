import { Mails, Clock, Send, Snowflake } from 'lucide-react';
import { StatTile } from '@/components/stat-tile';
import { formatDuration, formatNumber } from '@/lib/format';
import type { QueueSummary } from '../queue.types';

/** KPI tiles summarising the outbound queue. */
export function QueueStats({ summary }: { summary: QueueSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="In queue"
        value={formatNumber(summary.total)}
        hint={`oldest ${formatDuration(summary.oldestAgeSeconds)}`}
        icon={<Mails className="h-4 w-4" />}
        accent="bg-sky-500/15 text-sky-500"
        surface="border-sky-500/20 from-sky-500/10 to-sky-500/5"
      />
      <StatTile
        label="Sending"
        value={formatNumber(summary.sending)}
        hint="active delivery"
        icon={<Send className="h-4 w-4" />}
        accent="bg-violet-500/15 text-violet-500"
        surface="border-violet-500/20 from-violet-500/10 to-violet-500/5"
      />
      <StatTile
        label="Deferred"
        value={formatNumber(summary.deferred)}
        hint="waiting to retry"
        icon={<Clock className="h-4 w-4" />}
        accent="bg-amber-500/15 text-amber-500"
        surface="border-amber-500/20 from-amber-500/10 to-amber-500/5"
      />
      <StatTile
        label="Frozen"
        value={formatNumber(summary.frozen)}
        hint="manual hold"
        icon={<Snowflake className="h-4 w-4" />}
        accent="bg-slate-500/15 text-slate-500"
        surface="border-slate-500/20 from-slate-500/10 to-slate-500/5"
      />
    </div>
  );
}
