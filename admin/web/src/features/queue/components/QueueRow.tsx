import { RotateCw, Snowflake, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatBytes, timeAgo } from '@/lib/format';
import type { QueuedMessage } from '../queue.types';
import { QueueStateBadge } from './QueueStateBadge';

/** One outbound queue entry with delivery actions. */
export function QueueRow({ message }: { message: QueuedMessage }) {
  return (
    <TableRow>
      <TableCell className="max-w-[10rem] truncate font-mono text-[11px] text-muted-foreground/80" title={message.id}>
        {message.id}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate text-xs" title={message.from}>
        {message.from}
      </TableCell>
      <TableCell className="max-w-[14rem] truncate text-xs" title={message.to.join(', ')}>
        {message.to[0]}
        {message.to.length > 1 && (
          <span className="text-muted-foreground/60"> +{message.to.length - 1}</span>
        )}
      </TableCell>
      <TableCell>
        <QueueStateBadge state={message.state} />
        {message.lastError && (
          <p className="mt-0.5 max-w-[16rem] truncate text-[10px] text-muted-foreground/60" title={message.lastError}>
            {message.lastError}
          </p>
        )}
      </TableCell>
      <TableCell className="text-center text-xs">{message.attempts}</TableCell>
      <TableCell className="text-right font-mono text-xs">{formatBytes(message.size)}</TableCell>
      <TableCell className="text-right text-xs text-muted-foreground/70">
        {message.nextRetryAt ? timeAgo(message.nextRetryAt) : '—'}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Retry now">
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Freeze">
            <Snowflake className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
