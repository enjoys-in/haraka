import { TableCell, TableRow } from '@/components/ui/table';
import { formatBytes, timeAgo } from '@/lib/format';
import type { QuarantinedMessage } from '../quarantine.types';
import { QuarantineReasonBadge } from './QuarantineReasonBadge';

/** One quarantined message row (read-only). */
export function QuarantineRow({ message }: { message: QuarantinedMessage }) {
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
    </TableRow>
  );
}
