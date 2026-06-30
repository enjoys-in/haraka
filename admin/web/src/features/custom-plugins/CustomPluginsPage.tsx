import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Save,
  Trash2,
  Loader2,
  Code2,
  FileCode2,
  AlertTriangle,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { CustomPlugin, PluginTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { MonacoCodeEditor } from '@/components/MonacoCodeEditor';
import { Page, PageScroll } from '@/components/page';

const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/;

export function CustomPluginsPage() {
  const { data, loading, error, reload, setData } = useAsyncData(api.customPlugins.list);
  const [templates, setTemplates] = useState<PluginTemplate[]>([]);
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('minimal');
  const [enableNow, setEnableNow] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [openName, setOpenName] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api.customPlugins
      .templates()
      .then((res) => {
        setTemplates(res.templates);
        if (res.templates[0]) setTemplateId((id) => id || res.templates[0].id);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load templates'));
  }, []);

  const selected = useMemo(
    () => templates.find((t) => t.id === templateId),
    [templates, templateId],
  );

  const nameValid = name === '' || NAME_RE.test(name);

  async function create() {
    if (!NAME_RE.test(name)) {
      toast.error('Name must start with a letter/digit and use only a-z 0-9 . _ -');
      return;
    }
    setCreating(true);
    try {
      const { plugin } = await api.customPlugins.create(name, templateId, enableNow);
      await reload();
      setOpenName(plugin.name);
      setName('');
      toast.success(
        `Created plugins/${plugin.name}.js${enableNow ? ' and enabled it' : ''} — restart Haraka to load it`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create plugin');
    } finally {
      setCreating(false);
    }
  }

  async function toggle(p: CustomPlugin, enabled: boolean) {
    setBusy(p.name);
    try {
      await api.customPlugins.setEnabled(p.name, enabled);
      await reload();
      toast.success(`${p.name} ${enabled ? 'enabled' : 'disabled'} — restart Haraka to apply`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update plugin');
    } finally {
      setBusy(null);
    }
  }

  async function remove(p: CustomPlugin) {
    if (!confirm(`Delete plugins/${p.name}.js and remove it from config/plugins? This cannot be undone.`)) {
      return;
    }
    setBusy(p.name);
    try {
      const res = await api.customPlugins.remove(p.name);
      setData({ plugins: res.plugins });
      if (openName === p.name) setOpenName(null);
      toast.success(`Deleted ${p.name} — restart Haraka to apply`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete plugin');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>Custom Plugins</CardTitle>
          <CardDescription>
            Write your own Haraka plugins from a starter template, edit them live, and enable them
            in <code>config/plugins</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p>
              <strong className="text-foreground">Plugin code runs inside your mail server</strong>{' '}
              with full Node.js access. Only add code you trust. New plugins and enable/disable
              changes need a <strong className="text-foreground">Haraka restart</strong>; editing an
              already-loaded plugin's code also needs a restart to take effect.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.4fr_1.6fr] sm:items-start">
            <div className="space-y-1.5">
              <Label>Plugin name</Label>
              <Input
                placeholder="e.g. block_keywords"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                className={!nameValid ? 'border-destructive' : undefined}
              />
              <p className="text-[11px] text-muted-foreground">
                Saved as{' '}
                <code className="text-foreground">plugins/{name || '<name>'}.js</code>. Letters,
                digits, <code>.</code> <code>_</code> <code>-</code> only.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Starter template</Label>
              <Combobox
                options={templates.map((t) => ({
                  value: t.id,
                  label: t.label,
                  description: t.hook,
                }))}
                value={templateId}
                onChange={setTemplateId}
                placeholder="Select a template…"
                searchPlaceholder="Search templates…"
                emptyText="No templates found."
              />
              {selected && (
                <p className="text-[11px] text-muted-foreground">
                  <code className="text-foreground">{selected.hook}</code> — {selected.description}
                </p>
              )}
            </div>
          </div>

          {selected && (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCode((v) => !v)}
                className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-3.5 w-3.5" />
                {showCode ? 'Hide' : 'Preview'} template code
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCode ? 'rotate-180' : ''}`} />
              </Button>
              {showCode && (
                <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                  {selected.code.replace(/__PLUGIN_NAME__/g, name || 'my_plugin')}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label className="flex items-center gap-2 text-sm font-normal">
              <Switch checked={enableNow} onCheckedChange={setEnableNow} />
              Enable in <code>config/plugins</code> now
            </Label>
            <Button onClick={() => void create()} disabled={creating || !NAME_RE.test(name)}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create plugin
            </Button>
          </div>
        </CardContent>
      </Card>

      <PageScroll>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              Your plugins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {data?.plugins.map((p) => (
              <PluginRow
                key={p.name}
                plugin={p}
                busy={busy === p.name}
                open={openName === p.name}
                onToggle={(v) => void toggle(p, v)}
                onEdit={() => setOpenName(openName === p.name ? null : p.name)}
                onDelete={() => void remove(p)}
              />
            ))}
            {data && data.plugins.length === 0 && !loading && (
              <p className="px-1 py-6 text-sm text-muted-foreground">
                No custom plugins yet — create one above to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </PageScroll>
    </Page>
  );
}

interface RowProps {
  plugin: CustomPlugin;
  busy: boolean;
  open: boolean;
  onToggle: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PluginRow({ plugin, busy, open, onToggle, onEdit, onDelete }: RowProps) {
  return (
    <div className="rounded-lg border border-transparent transition-colors hover:border-border/50 hover:bg-muted/40">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <FileCode2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <code className="truncate text-sm font-medium">{plugin.name}.js</code>
            {plugin.enabled ? (
              <Badge variant="success" className="px-1.5 py-0 text-[10px]">enabled</Badge>
            ) : (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">disabled</Badge>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {plugin.size} bytes · updated {new Date(plugin.modified).toLocaleString()}
          </p>
        </div>
        <Button variant={open ? 'secondary' : 'ghost'} size="sm" onClick={onEdit}>
          <Code2 className="h-3.5 w-3.5" />
          Edit code
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" disabled={busy} onClick={onDelete} title="Delete plugin">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <Switch checked={plugin.enabled} disabled={busy} onCheckedChange={onToggle} />
      </div>
      {open && <CodeEditor name={plugin.name} />}
    </div>
  );
}

function CodeEditor({ name }: { name: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.customPlugins
      .get(name)
      .then((res) => {
        if (active) setContent(res.plugin.content);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load plugin');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [name]);

  async function save() {
    setSaving(true);
    try {
      const res = await api.customPlugins.save(name, content);
      setContent(res.plugin.content);
      toast.success(`Saved plugins/${name}.js — restart Haraka to apply`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save plugin');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-border/40 px-3 py-3">
      <p className="mb-2 text-[11px] text-muted-foreground">
        Editing <code className="text-foreground">plugins/{name}.js</code> — plain Node.js /
        CommonJS. See the{' '}
        <a
          href="https://haraka.github.io/core/Plugins"
          target="_blank"
          rel="noreferrer"
          className="text-[#FFA724] hover:underline"
        >
          Haraka plugin API ↗
        </a>
        .
      </p>
      {loading ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : error ? (
        <p className="py-4 text-sm text-destructive">{error}</p>
      ) : (
        <>
          <MonacoCodeEditor
            value={content}
            onChange={setContent}
            language="javascript"
            height={320}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
