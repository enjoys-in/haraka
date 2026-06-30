import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ServerSettings } from '@/lib/types';

/** Loads and saves the real server settings (config/me, connection.ini, smtp.ini). */
export function useSettings() {
  const [settings, setSettings] = useState<ServerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { settings: s } = await api.settings.get();
      setSettings(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (input: Partial<ServerSettings>) => {
    setBusy(true);
    try {
      const { settings: s } = await api.settings.set(input);
      setSettings(s);
      toast.success('Settings saved');
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save settings');
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { settings, loading, busy, error, reload: load, save };
}
