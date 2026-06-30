import { TableCell, TableRow } from '@/components/ui/table';
import { formatBytes, timeAgo } from '@/lib/format';
import type { QueuedMessage } from '../queue.types';
import { QueueStateBadge } from './QueueStateBadge';

/** One outbound queue entry (read-only). */
export function QueueRow({ message }: { message: QueuedMessage }) {
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
    </TableRow>
  );
}
