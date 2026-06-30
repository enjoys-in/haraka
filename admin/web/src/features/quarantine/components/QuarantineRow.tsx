import { MailCheck, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatBytes, timeAgo } from '@/lib/format';
import type { QuarantinedMessage } from '../quarantine.types';
import { QuarantineReasonBadge } from './QuarantineReasonBadge';

/** One quarantined message row with release / delete actions. */
export function QuarantineRow({ message }: { message: QuarantinedMessage }) {
  return (
    <TableRow>
      <TableCell className="max-w-[12rem] truncate text-xs" title={message.from}>
        {message.from}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate text-xs" title={message.to}>
        {message.to}
      </TableCell>
      <TableCell className="max-w-[16rem] truncate text-xs" title={message.subject}>
        {message.subject}
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
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-emerald-600 hover:text-emerald-600"
            title="Release"
          >
            <MailCheck className="h-3.5 w-3.5" />
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
