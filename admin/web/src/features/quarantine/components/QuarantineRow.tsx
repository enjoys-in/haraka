import { Send, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatBytes, timeAgo } from '@/lib/format';
import type { QuarantinedMessage } from '../quarantine.types';
import { QuarantineReasonBadge } from './QuarantineReasonBadge';

/** One quarantined message row with release / delete actions. */
export function QuarantineRow({
  message,
  onRelease,
  onRemove,
  busy,
}: {
  message: QuarantinedMessage;
  onRelease?: (id: string) => void;
  onRemove?: (id: string) => void;
  busy?: boolean;
}) {
  const showActions = Boolean(onRelease || onRemove);
  return (
    <TableRow>
      <TableCell className="max-w-[12rem] truncate text-xs" title={message.from}>
        {message.from || <span className="text-muted-foreground/50">—</span>}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate text-xs" title={message.to}>
        {message.to || <span className="text-muted-foreground/50">—</span>}
      </TableCell>
      <TableCell className="max-w-[16rem] truncate text-xs" title={message.subject}>
        {message.subject || <span className="text-muted-foreground/50">(no subject)</span>}
      </TableCell>
      <TableCell>
        <QuarantineReasonBadge reason={message.reason} />
      </TableCell>
      <TableCell className="text-center text-xs">
        {message.score == null ? (
          <span className="text-muted-foreground/40">—</span>
        ) : (
          <span className="font-semibold text-red-500">{message.score.toFixed(1)}</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-xs">{formatBytes(message.size)}</TableCell>
      <TableCell className="text-right text-xs text-muted-foreground/70">
        {timeAgo(message.quarantinedAt)}
      </TableCell>
      {showActions && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            {onRelease && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-600 hover:text-emerald-600"
                disabled={busy}
                onClick={() => onRelease(message.id)}
                title="Release for delivery"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => onRemove(message.id)}
                title="Delete permanently"
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
