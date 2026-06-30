import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, ExternalLink, Settings2, Save, ChevronDown, Loader2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { PluginInfo } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_ORDER = [
  'Core', 'Connection', 'HELO', 'TLS / Security', 'Authentication',
  'MAIL FROM', 'RCPT TO', 'Data / Headers', 'Anti-Spam', 'Anti-Virus',
  'Queue / Delivery', 'Monitoring', 'Other',
];

export function PluginsPage() {
  const { data, loading, error, setData } = useAsyncData(api.plugins.list);
  const [busy, setBusy] = useState<string | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  async function toggle(p: PluginInfo, enabled: boolean) {
    setBusy(p.name);
    try {
      const res = await api.plugins.set(p.name, enabled);
      setData(res);
      toast.success(`${p.label} ${enabled ? 'enabled' : 'disabled'} — restart Haraka to apply`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update plugin');
    } finally {
      setBusy(null);
    }
  }

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (data?.plugins ?? []).filter(
      (p) => !q || `${p.name} ${p.label} ${p.description} ${p.category}`.toLowerCase().includes(q)
    );
    const byCat = new Map<string, PluginInfo[]>();
    for (const p of list) {
      const arr = byCat.get(p.category) ?? [];
      arr.push(p);
      byCat.set(p.category, arr);
    }
    return [...byCat.entries()].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0])
    );
  }, [data, query]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plugins</CardTitle>
          <CardDescription>Toggle plugins on/off and edit each plugin's config file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#FFA724]" />
            <p>
              <strong className="text-foreground">Enable / disable</strong> is saved to{' '}
              <code>config/plugins</code> and needs a <strong>Haraka restart</strong> to take effect.{' '}
              <strong className="text-foreground">Config edits</strong> are written to the plugin's file
              and picked up automatically by Haraka's config reload — no restart needed.
            </p>
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

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {groups.map(([category, plugins]) => (
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
                onConfigure={() => setOpenName(openName === p.name ? null : p.name)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface RowProps {
  plugin: PluginInfo;
  busy: boolean;
  open: boolean;
  onToggle: (v: boolean) => void;
  onConfigure: () => void;
}

function PluginRow({ plugin, busy, open, onToggle, onConfigure }: RowProps) {
  return (
    <div className="rounded-lg border border-transparent transition-colors hover:border-border/50 hover:bg-muted/40">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{plugin.label}</span>
            <code className="truncate text-[11px] text-muted-foreground">{plugin.name}</code>
            {plugin.enabled && (
              <Badge variant="success" className="px-1.5 py-0 text-[10px]">on</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{plugin.description}</p>
        </div>
        <a
          href={plugin.docsUrl}
          target="_blank"
          rel="noreferrer"
          title="Open documentation"
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        {plugin.configFile && (
          <Button
            variant={open ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onConfigure}
            title={`Edit config/${plugin.configFile}`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configure
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        )}
        <Switch checked={plugin.enabled} disabled={busy} onCheckedChange={onToggle} />
      </div>
      {open && plugin.configFile && <ConfigEditor plugin={plugin} />}
    </div>
  );
}

function ConfigEditor({ plugin }: { plugin: PluginInfo }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.plugins
      .getConfig(plugin.name)
      .then((res) => {
        if (active) setContent(res.config.content);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load config');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [plugin.name]);

  async function save() {
    setSaving(true);
    try {
      const res = await api.plugins.saveConfig(plugin.name, content);
      setContent(res.config.content);
      toast.success(`Saved config/${plugin.configFile}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-border/40 px-3 py-3">
      <p className="mb-2 text-[11px] text-muted-foreground">
        Editing <code className="text-foreground">config/{plugin.configFile}</code> — INI format
        (lines starting with <code>;</code> or <code>#</code> are comments).{' '}
        <a
          href={plugin.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[#FFA724] hover:underline"
        >
          View all options ↗
        </a>
      </p>
      {loading ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : error ? (
        <p className="py-4 text-sm text-destructive">{error}</p>
      ) : (
        <>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`; config/${plugin.configFile} is empty — add settings here`}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save &amp; reload
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
