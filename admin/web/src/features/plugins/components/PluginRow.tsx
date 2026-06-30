import { Save, Loader2, Settings2, ChevronDown, ExternalLink } from 'lucide-react';
import type { PluginInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MonacoCodeEditor } from '@/components/MonacoCodeEditor';
import { usePluginConfig } from '../usePluginConfig';
import { AccessConfigPanel } from './AccessConfigPanel';

interface PluginRowProps {
  plugin: PluginInfo;
  busy: boolean;
  open: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
}

export function PluginRow({ plugin, busy, open, onToggle, onConfigure }: PluginRowProps) {
  return (
    <div className="rounded-lg border border-transparent transition-colors hover:border-border/50 hover:bg-muted/40">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{plugin.label}</span>
            <code className="truncate text-[11px] text-muted-foreground">{plugin.name}</code>
            {plugin.enabled && (
              <Badge variant="success" className="px-1.5 py-0 text-[10px]">on</Badge>
            )}
            {plugin.source === 'core' && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">core</Badge>
            )}
            {plugin.role === 'both' && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-muted-foreground">
                in &amp; out
              </Badge>
            )}
            {!plugin.available && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-muted-foreground">
                not installed
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{plugin.description}</p>
          {!plugin.available && plugin.npmPackage && (
            <code className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground">
              npm install {plugin.npmPackage}
            </code>
          )}
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
        {plugin.available && plugin.configFile && (
          <Button
            variant={open ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onConfigure}
            title={plugin.name === 'access' ? 'Manage access rules' : `Edit config/${plugin.configFile}`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configure
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        )}
        <Switch
          checked={plugin.enabled}
          disabled={busy || !plugin.available}
          onCheckedChange={onToggle}
          title={plugin.available ? undefined : 'Install this plugin before it can be enabled'}
        />
      </div>
      {open &&
        plugin.available &&
        plugin.configFile &&
        (plugin.name === 'access' ? (
          <AccessConfigPanel enabled={plugin.enabled} />
        ) : (
          <ConfigEditor plugin={plugin} />
        ))}
    </div>
  );
}

function ConfigEditor({ plugin }: { plugin: PluginInfo }) {
  const { content, setContent, loading, saving, error, save } = usePluginConfig(plugin);

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
          <MonacoCodeEditor
            value={content}
            onChange={setContent}
            language="ini"
            height={300}
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
