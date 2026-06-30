import { ArrowUpFromLine, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LogSource } from '../useLogStream';

const SOURCES: { value: LogSource; label: string; icon: typeof Server }[] = [
  { value: 'system', label: 'System', icon: Server },
  { value: 'outbound', label: 'Outbound', icon: ArrowUpFromLine },
];

/** Segmented control to switch the log viewer between system and outbound streams. */
export function LogSourceToggle({
  value,
  onChange,
}: {
  value: LogSource;
  onChange: (value: LogSource) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border bg-muted/40 p-0.5">
      {SOURCES.map(({ value: v, label, icon: Icon }) => (
        <Button
          key={v}
          size="sm"
          variant={value === v ? 'default' : 'ghost'}
          className={cn('h-7 px-3 text-xs', value === v && 'shadow-sm')}
          onClick={() => onChange(v)}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}
