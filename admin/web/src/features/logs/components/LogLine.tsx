import { formatDateTime } from '@/lib/format';
import type { LogEntry } from '../logs.types';
import { LogLevelBadge } from './LogLevelBadge';

/** A single monospace log line. */
export function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex items-start gap-3 px-3 py-1 font-mono text-xs hover:bg-muted/40">
      <span className="shrink-0 text-muted-foreground/50">{formatDateTime(entry.timestamp)}</span>
      <LogLevelBadge level={entry.level} />
      {entry.plugin && <span className="shrink-0 text-violet-500/80">[{entry.plugin}]</span>}
      {entry.connectionId && (
        <span className="shrink-0 text-muted-foreground/40">{entry.connectionId}</span>
      )}
      <span className="break-all text-foreground/90">{entry.message}</span>
    </div>
  );
}
