import {
  RefreshCw,
  Server,
  Send,
  ShieldCheck,
  Shield,
  Bug,
  Database,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { ServiceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Page, PageScroll } from '@/components/page';

const ICONS: Record<string, LucideIcon> = {
  smtp_25: Server,
  submission_587: Send,
  spamassassin: ShieldCheck,
  rspamd: Shield,
  clamd: Bug,
  redis: Database,
};

export function Dashboard() {
  // real-time: silently re-probe every 5s
  const { data, loading, error, reload } = useAsyncData(api.status, 5000);

  const services = data?.services ?? [];
  const up = services.filter((s) => s.up).length;
  const down = services.length - up;

  return (
    <Page className="gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {data ? `config: ${data.configDir}` : 'Real-time service health on 127.0.0.1'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => void reload()}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <PageScroll className="space-y-6">
        {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Services"
          value={String(services.length || '—')}
          icon={<Activity className="h-4 w-4" />}
          gradient="from-[#FFA724]/10 to-[#FFA724]/5"
          iconBg="bg-[#FFA724]/15 text-[#FFA724]"
          borderColor="border-[#FFA724]/20"
        />
        <StatCard
          title="Online"
          value={String(up)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          gradient="from-emerald-500/10 to-emerald-500/5"
          iconBg="bg-emerald-500/15 text-emerald-500"
          borderColor="border-emerald-500/20"
        />
        <StatCard
          title="Offline"
          value={String(down)}
          icon={<XCircle className="h-4 w-4" />}
          gradient="from-red-500/10 to-red-500/5"
          iconBg="bg-red-500/15 text-red-500"
          borderColor="border-red-500/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.key} service={s} />
        ))}
      </div>
      </PageScroll>
    </Page>
  );
}

function ServiceCard({ service: s }: { service: ServiceStatus }) {
  const Icon = ICONS[s.key] ?? Server;
  return (
    <Card
      className={`group overflow-hidden border bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${
        s.up
          ? 'border-emerald-500/20 from-emerald-500/5 to-transparent'
          : 'border-red-500/20 from-red-500/5 to-transparent'
      }`}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`rounded-xl p-1.5 transition-transform duration-300 group-hover:scale-110 ${
              s.up ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
              s.up
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${s.up ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`}
            />
            {s.up ? 'up' : 'down'}
          </span>
        </div>
        <div className="text-sm font-semibold tracking-tight">{s.label}</div>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">
          {s.host}:{s.port}
        </p>
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  iconBg,
  borderColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  borderColor: string;
}) {
  return (
    <Card
      className={`group overflow-hidden border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${borderColor} ${gradient}`}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {title}
          </span>
          <div
            className={`rounded-xl p-1.5 transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
          >
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
