import { Server, Mails, Clock, Send, ShieldX, Timer, Inbox } from 'lucide-react';
import { StatTile } from '@/components/stat-tile';
import { formatDuration, formatNumber } from '@/lib/format';
import type { MonitoringSnapshot } from '../monitoring.types';

/** KPI grid summarising real service health, queue depth and delivery outcomes. */
export function LiveStatsGrid({ snapshot }: { snapshot: MonitoringSnapshot | null }) {
  const servicesUp = snapshot ? snapshot.services.filter((s) => s.up).length : 0;
  const servicesTotal = snapshot ? snapshot.services.length : 0;
  const queue = snapshot?.queue ?? { total: 0, deferred: 0, oldestAgeSeconds: 0 };
  const delivery = snapshot?.delivery ?? { total: 0, delivered: 0, deferred: 0, bounced: 0 };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Services up"
        value={`${servicesUp}/${servicesTotal}`}
        hint="probed endpoints healthy"
        icon={<Server className="h-4 w-4" />}
        accent="bg-emerald-500/15 text-emerald-500"
        surface="border-emerald-500/20 from-emerald-500/10 to-emerald-500/5"
      />
      <StatTile
        label="In queue"
        value={formatNumber(queue.total)}
        hint={`oldest ${formatDuration(queue.oldestAgeSeconds)}`}
        icon={<Mails className="h-4 w-4" />}
        accent="bg-sky-500/15 text-sky-500"
        surface="border-sky-500/20 from-sky-500/10 to-sky-500/5"
      />
      <StatTile
        label="Queue deferred"
        value={formatNumber(queue.deferred)}
        hint="waiting to retry"
        icon={<Clock className="h-4 w-4" />}
        accent="bg-amber-500/15 text-amber-500"
        surface="border-amber-500/20 from-amber-500/10 to-amber-500/5"
      />
      <StatTile
        label="Uptime"
        value={formatDuration(snapshot?.uptimeSeconds ?? 0)}
        hint="admin monitor"
        icon={<Timer className="h-4 w-4" />}
        accent="bg-[#FFA724]/15 text-[#FFA724]"
        surface="border-[#FFA724]/20 from-[#FFA724]/10 to-[#FFA724]/5"
      />
      <StatTile
        label="Delivered"
        value={formatNumber(delivery.delivered)}
        hint="recent outbound"
        icon={<Send className="h-4 w-4" />}
        accent="bg-teal-500/15 text-teal-500"
        surface="border-teal-500/20 from-teal-500/10 to-teal-500/5"
      />
      <StatTile
        label="Deferred"
        value={formatNumber(delivery.deferred)}
        hint="recent outbound"
        icon={<Inbox className="h-4 w-4" />}
        accent="bg-violet-500/15 text-violet-500"
        surface="border-violet-500/20 from-violet-500/10 to-violet-500/5"
      />
      <StatTile
        label="Bounced"
        value={formatNumber(delivery.bounced)}
        hint="recent outbound"
        icon={<ShieldX className="h-4 w-4" />}
        accent="bg-red-500/15 text-red-500"
        surface="border-red-500/20 from-red-500/10 to-red-500/5"
      />
      <StatTile
        label="Delivery log"
        value={formatNumber(delivery.total)}
        hint="records sampled"
        icon={<Mails className="h-4 w-4" />}
        accent="bg-indigo-500/15 text-indigo-500"
        surface="border-indigo-500/20 from-indigo-500/10 to-indigo-500/5"
      />
    </div>
  );
}
