import { cn } from '@/lib/utils';
import type { LogLevel } from '../logs.types';

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'text-muted-foreground/70',
  info: 'text-sky-500',
  notice: 'text-emerald-500',
  warn: 'text-amber-500',
  error: 'text-red-500',
  crit: 'text-red-600 font-bold',
};

/** Fixed-width colored log level tag for monospace log lines. */
export function LogLevelBadge({ level }: { level: LogLevel }) {
  return (
    <span className={cn('w-14 shrink-0 font-mono text-[10px] font-semibold uppercase', LEVEL_STYLES[level])}>
      {level}
    </span>
  );
}
