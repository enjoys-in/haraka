import type { LogEntry, LogLevel } from '@/lib/types';

/** Filter entries by level and a free-text query (message / plugin / connection). */
export function filterLogs(
  entries: LogEntry[],
  level: 'all' | LogLevel,
  query: string,
): LogEntry[] {
  const q = query.trim().toLowerCase();
  return entries.filter((e) => {
    if (level !== 'all' && e.level !== level) return false;
    if (!q) return true;
    return `${e.message} ${e.plugin ?? ''} ${e.connectionId ?? ''}`.toLowerCase().includes(q);
  });
}

/** Download the given entries as a pretty-printed JSON file. */
export function downloadLogsJson(entries: LogEntry[], filename: string): void {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
