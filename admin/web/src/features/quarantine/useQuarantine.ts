import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';

/** Loads quarantined messages (polling) and exposes release / delete actions
 *  that mutate the real quarantine directory and refresh from the response. */
export function useQuarantine() {
  const { data, loading, error, reload, setData } = useAsyncData(
    () => api.quarantine.list(),
    15000,
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const release = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setData(await api.quarantine.release(id));
        toast.success('Message released for delivery');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to release message');
      } finally {
        setBusyId(null);
      }
    },
    [setData],
  );

  const remove = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setData(await api.quarantine.remove(id));
        toast.success('Message deleted from quarantine');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to delete message');
      } finally {
        setBusyId(null);
      }
    },
    [setData],
  );

  return { data, loading, error, reload, busyId, release, remove };
}
