import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { AliasAction, MailAlias } from '@/lib/types';

/** Loads and mutates the real alias map in config/aliases. */
export function useAliases() {
  const [aliases, setAliases] = useState<MailAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { aliases: list } = await api.aliases.list();
      setAliases(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load aliases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (address: string, destinations: string[], action: AliasAction) => {
      setBusy(true);
      try {
        const { aliases: list } = await api.aliases.save(address, destinations, action);
        setAliases(list);
        toast.success(`Saved ${address}`);
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to save alias');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const remove = useCallback(async (address: string) => {
    setBusy(true);
    try {
      const { aliases: list } = await api.aliases.remove(address);
      setAliases(list);
      toast.success(`Removed ${address}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove alias');
    } finally {
      setBusy(false);
    }
  }, []);

  return { aliases, loading, busy, error, reload: load, save, remove };
}
