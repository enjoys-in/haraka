import { Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageScroll } from '@/components/page';
import { usePlugins, type FlowRole } from './usePlugins';
import { PluginRow } from './components/PluginRow';

export interface PluginsViewProps {
  role: FlowRole;
  title: string;
  description: string;
  intro: string;
}

export function PluginsView({ role, title, description, intro }: PluginsViewProps) {
  const { groups, counts, loading, error, busy, openName, query, setQuery, toggle, toggleOpen } =
    usePlugins(role);

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant="success" className="px-2 py-0 text-[11px]">{counts.enabled} enabled</Badge>
            <Badge variant="secondary" className="px-2 py-0 text-[11px]">{counts.ready} ready to use</Badge>
            <Badge variant="outline" className="px-2 py-0 text-[11px]">{counts.total} available</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#FFA724]" />
            <p>{intro}</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plugins…"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <PageScroll>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && groups.length === 0 && (
          <p className="text-sm text-muted-foreground">No plugins match your search.</p>
        )}

        {groups.map(({ category, plugins }) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {plugins.map((p) => (
                <PluginRow
                  key={p.name}
                  plugin={p}
                  busy={busy === p.name}
                  open={openName === p.name}
                  onToggle={(v) => void toggle(p, v)}
                  onConfigure={() => toggleOpen(p.name)}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </PageScroll>
    </Page>
  );
}
