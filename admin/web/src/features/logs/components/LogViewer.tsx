import { ScrollText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { LogEntry } from '../logs.types';
import { LogLine } from './LogLine';

/** Scrollable terminal-style log output. */
export function LogViewer({ entries }: { entries: LogEntry[] }) {
  return (
    <Card className="overflow-hidden bg-muted/20">
      {entries.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-8 w-8" />}
          title="No log output"
          description="Live log lines will stream here."
        />
      ) : (
        <div className="max-h-[60vh] divide-y divide-border/40 overflow-y-auto">
          {entries.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
}
