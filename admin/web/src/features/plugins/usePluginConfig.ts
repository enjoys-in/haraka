import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { PluginInfo } from '@/lib/types';

/** Loads and saves a single plugin's config file for the inline editor. */
export function usePluginConfig(plugin: PluginInfo) {
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

  const save = useCallback(async () => {
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
  }, [plugin.name, plugin.configFile, content]);

  return { content, setContent, loading, saving, error, save };
}
