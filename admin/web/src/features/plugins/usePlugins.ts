import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { PluginInfo } from '@/lib/types';

/** Mail flow a plugins view is scoped to. */
export type FlowRole = 'inbound' | 'outbound';

export interface PluginGroup {
  category: string;
  plugins: PluginInfo[];
}

export interface PluginCounts {
  enabled: number;
  ready: number;
  total: number;
}

const CATEGORY_ORDER = [
  'Core', 'Connection', 'HELO', 'TLS / Security', 'Authentication',
  'MAIL FROM', 'RCPT TO', 'Data / Headers', 'Anti-Spam', 'Anti-Virus',
  'Queue / Delivery', 'Outbound', 'Monitoring', 'Other',
];

// A plugin belongs to a flow when its role matches that flow or applies to both.
function matchesRole(plugin: PluginInfo, role: FlowRole): boolean {
  return plugin.role === role || plugin.role === 'both';
}

/**
 * Loads the plugin catalog, scopes it to a single mail flow (inbound/outbound),
 * and owns all the interaction logic (search, toggle, expand) so page
 * components stay declarative.
 */
export function usePlugins(role: FlowRole) {
  const { data, loading, error, setData } = useAsyncData(api.plugins.list);
  const [busy, setBusy] = useState<string | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const scoped = useMemo(
    () => (data?.plugins ?? []).filter((p) => matchesRole(p, role)),
    [data, role],
  );

  const groups = useMemo<PluginGroup[]>(() => {
    const q = query.trim().toLowerCase();
    const list = scoped.filter(
      (p) => !q || `${p.name} ${p.label} ${p.description} ${p.category}`.toLowerCase().includes(q),
    );
    const byCat = new Map<string, PluginInfo[]>();
    for (const p of list) {
      const arr = byCat.get(p.category) ?? [];
      arr.push(p);
      byCat.set(p.category, arr);
    }
    return [...byCat.entries()]
      .sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]))
      .map(([category, plugins]) => ({ category, plugins }));
  }, [scoped, query]);

  const counts = useMemo<PluginCounts>(
    () => ({
      enabled: scoped.filter((p) => p.enabled).length,
      ready: scoped.filter((p) => p.available).length,
      total: scoped.length,
    }),
    [scoped],
  );

  const toggle = useCallback(
    async (plugin: PluginInfo, enabled: boolean) => {
      setBusy(plugin.name);
      try {
        const res = await api.plugins.set(plugin.name, enabled);
        setData(res);
        toast.success(`${plugin.label} ${enabled ? 'enabled' : 'disabled'} — restart Haraka to apply`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to update plugin');
      } finally {
        setBusy(null);
      }
    },
    [setData],
  );

  const toggleOpen = useCallback((name: string) => {
    setOpenName((cur) => (cur === name ? null : name));
  }, []);

  return {
    groups,
    counts,
    loading,
    error,
    busy,
    openName,
    query,
    setQuery,
    toggle,
    toggleOpen,
  };
}
