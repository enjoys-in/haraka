import { RotateCw, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatBytes, timeAgo } from '@/lib/format';
import type { QueuedMessage } from '../queue.types';
import { QueueStateBadge } from './QueueStateBadge';

/** One outbound queue entry with retry / delete actions. */
export function QueueRow({
  message,
  onRetry,
  onRemove,
  busy,
}: {
  message: QueuedMessage;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  busy?: boolean;
}) {
  const showActions = Boolean(onRetry || onRemove);
  return (
    <TableRow>
      <TableCell className="max-w-[10rem] truncate font-mono text-[11px] text-muted-foreground/80" title={message.id}>
        {message.id}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate text-xs" title={message.from}>
        {message.from || <span className="text-muted-foreground/50">—</span>}
      </TableCell>
      <TableCell className="max-w-[14rem] truncate text-xs" title={message.to.join(', ')}>
        {message.to[0] ?? <span className="text-muted-foreground/50">—</span>}
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
      {showActions && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            {onRetry && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={busy}
                onClick={() => onRetry(message.id)}
                title="Retry now"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => onRemove(message.id)}
                title="Delete from queue"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
