import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';

/** Loads the outbound queue (polling) and exposes retry / delete actions that
 *  mutate the real spool and refresh the view from the server response. */
export function useQueue() {
  const { data, loading, error, reload, setData } = useAsyncData(() => api.queue.get(), 5000);
  const [busyId, setBusyId] = useState<string | null>(null);

  const retry = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setData(await api.queue.retry(id));
        toast.success('Message scheduled for immediate retry');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to retry message');
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
        setData(await api.queue.remove(id));
        toast.success('Message removed from queue');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to remove message');
      } finally {
        setBusyId(null);
      }
    },
    [setData],
  );

  return { data, loading, error, reload, busyId, retry, remove };
}
