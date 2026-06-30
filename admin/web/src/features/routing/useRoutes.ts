import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { TransportRoute } from '@/lib/types';

/** Loads and mutates outbound forward routes in config/smtp_forward.ini. */
export function useRoutes() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { routes: list } = await api.routing.list();
      setRoutes(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (domain: string, host: string, port: number, tls: boolean) => {
    setBusy(true);
    try {
      const { routes: list } = await api.routing.save(domain, host, port, tls);
      setRoutes(list);
      toast.success(`Saved route for ${domain}`);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save route');
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = useCallback(async (domain: string) => {
    setBusy(true);
    try {
      const { routes: list } = await api.routing.remove(domain);
      setRoutes(list);
      toast.success(`Removed route for ${domain}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove route');
    } finally {
      setBusy(false);
    }
  }, []);

  return { routes, loading, busy, error, reload: load, save, remove };
}
