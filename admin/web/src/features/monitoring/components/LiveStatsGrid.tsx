import { ArrowDownToLine, ArrowUpFromLine, Send, Inbox, ShieldX, Clock, Gauge, Timer } from 'lucide-react';
import { StatTile } from '@/components/stat-tile';
import { formatDuration, formatNumber } from '@/lib/format';
import type { LiveStats } from '../monitoring.types';

/** KPI grid summarising live inbound/outbound traffic (watch-style). */
export function LiveStatsGrid({ stats }: { stats: LiveStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Inbound active"
        value={formatNumber(stats.inboundActive)}
        hint={`${formatNumber(stats.inboundTotal)} total`}
        icon={<ArrowDownToLine className="h-4 w-4" />}
        accent="bg-sky-500/15 text-sky-500"
        surface="border-sky-500/20 from-sky-500/10 to-sky-500/5"
      />
      <StatTile
        label="Outbound active"
        value={formatNumber(stats.outboundActive)}
        hint={`${formatNumber(stats.throughputPerMin)}/min throughput`}
        icon={<ArrowUpFromLine className="h-4 w-4" />}
        accent="bg-violet-500/15 text-violet-500"
        surface="border-violet-500/20 from-violet-500/10 to-violet-500/5"
      />
      <StatTile
        label="Mail sent"
        value={formatNumber(stats.mailSent)}
        hint="delivered outbound"
        icon={<Send className="h-4 w-4" />}
        accent="bg-emerald-500/15 text-emerald-500"
        surface="border-emerald-500/20 from-emerald-500/10 to-emerald-500/5"
      />
      <StatTile
        label="Mail received"
        value={formatNumber(stats.mailReceived)}
        hint="accepted inbound"
        icon={<Inbox className="h-4 w-4" />}
        accent="bg-teal-500/15 text-teal-500"
        surface="border-teal-500/20 from-teal-500/10 to-teal-500/5"
      />
      <StatTile
        label="Rejected"
        value={formatNumber(stats.rejected)}
        hint="policy / spam / auth"
        icon={<ShieldX className="h-4 w-4" />}
        accent="bg-red-500/15 text-red-500"
        surface="border-red-500/20 from-red-500/10 to-red-500/5"
      />
      <StatTile
        label="Deferred"
        value={formatNumber(stats.deferred)}
        hint="waiting to retry"
        icon={<Clock className="h-4 w-4" />}
        accent="bg-amber-500/15 text-amber-500"
        surface="border-amber-500/20 from-amber-500/10 to-amber-500/5"
      />
      <StatTile
        label="Throughput"
        value={`${formatNumber(stats.throughputPerMin)}/min`}
        hint="messages per minute"
        icon={<Gauge className="h-4 w-4" />}
        accent="bg-indigo-500/15 text-indigo-500"
        surface="border-indigo-500/20 from-indigo-500/10 to-indigo-500/5"
      />
      <StatTile
        label="Uptime"
        value={formatDuration(stats.uptimeSeconds)}
        hint="since last restart"
        icon={<Timer className="h-4 w-4" />}
        accent="bg-[#FFA724]/15 text-[#FFA724]"
        surface="border-[#FFA724]/20 from-[#FFA724]/10 to-[#FFA724]/5"
      />
    </div>
  );
}
