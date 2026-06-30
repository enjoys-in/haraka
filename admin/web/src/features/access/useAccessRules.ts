import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { AccessAcl, AccessAction, AccessScope } from '@/lib/types';

/** Loads the access plugin's allow/deny lists and adds/removes rules against
 *  the real list files. `enabled` reflects whether the plugin is active. */
export function useAccessRules() {
  const [acl, setAcl] = useState<AccessAcl>({ enabled: false, rules: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAcl(await api.plugins.access.rules());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load access rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (scope: AccessScope, action: AccessAction, pattern: string) => {
      setBusy(true);
      try {
        setAcl(await api.plugins.access.add(scope, action, pattern));
        toast.success(`Added ${action} rule`);
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to add rule');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const remove = useCallback(
    async (scope: AccessScope, action: AccessAction, pattern: string) => {
      setBusy(true);
      try {
        setAcl(await api.plugins.access.remove(scope, action, pattern));
        toast.success('Removed rule');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to remove rule');
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { acl, loading, busy, error, reload: load, add, remove };
}
