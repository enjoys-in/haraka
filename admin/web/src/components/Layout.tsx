import { Suspense, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Moon, Sun, Menu, X, Zap, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/PageSkeleton';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { useDarkMode } from '@/lib/use-dark-mode';
import { NAV_GROUPS } from '@/routes/nav';

export function Layout() {
  const { dark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // live liveness probe — succeeds => online, fails => offline
  const { data, error } = useAsyncData(api.status, 8000);
  const isLive = data ? !error : null;

  const closeSidebar = () => setSidebarOpen(false);

  const sidebar = (showClose: boolean) => (
    <>
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFA724] to-[#FF6B00] text-white shadow-lg shadow-[#FFA724]/25">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-[#FFA724] to-[#FF6B00] bg-clip-text text-[15px] font-bold tracking-tight text-transparent">
              Haraka
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Admin Console
            </p>
          </div>
        </div>
        {showClose && (
          <Button variant="ghost" size="sm" className="h-7 w-7 px-0 lg:hidden" onClick={closeSidebar}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FFA724]/15 to-[#FFA724]/5 text-[#FFA724] shadow-sm ring-1 ring-[#FFA724]/15'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/40 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${
                isLive ? 'bg-emerald-400' : isLive === false ? 'bg-red-400' : 'bg-muted-foreground/50'
              }`}
            />
            <span className="text-[11px] font-medium text-muted-foreground/70">v1.0.0</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/enjoys-in/haraka"
              target="_blank"
              rel="noreferrer"
              title="View source on GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg px-0" onClick={toggle}>
              {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="gradient-mesh flex h-screen overflow-hidden bg-background">
      <aside
        className="glass hidden w-[260px] shrink-0 flex-col border-r border-border/40 lg:flex"
        style={{ boxShadow: 'var(--sidebar-shadow)' }}
      >
        {sidebar(false)}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSidebar} />
          <aside className="glass animate-fade-in fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border/40 shadow-2xl">
            {sidebar(true)}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="glass-subtle flex h-14 shrink-0 items-center gap-3 border-b border-border/40 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg px-0"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggle}
          >
            {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>
          {isLive === null ? (
            <Badge tone="muted" label="Checking..." />
          ) : isLive ? (
            <Badge tone="emerald" label="Online" />
          ) : (
            <Badge tone="red" label="Offline" />
          )}
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="animate-fade-in mx-auto flex h-full max-w-7xl flex-col p-4 lg:p-6">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function Badge({ tone, label }: { tone: 'emerald' | 'red' | 'muted'; label: string }) {
  const styles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    muted: 'glass border-border/50 text-muted-foreground',
  }[tone];
  const dot = { emerald: 'bg-emerald-400', red: 'bg-red-400', muted: 'bg-muted-foreground/50' }[tone];
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${styles}`}>
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${dot}`} />
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
  );
}
