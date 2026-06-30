import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatBytes, timeAgo } from '@/lib/format';
import type { MailRecord } from '../mailHistory.types';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';

/** One row in the mail delivery history table. */
export function MailHistoryRow({ record }: { record: MailRecord }) {
  const inbound = record.direction === 'inbound';
  return (
    <TableRow>
      <TableCell>
        {inbound ? (
          <ArrowDownToLine className="h-4 w-4 text-sky-500" />
        ) : (
          <ArrowUpFromLine className="h-4 w-4 text-violet-500" />
        )}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate text-xs" title={record.from}>
        {record.from}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate text-xs" title={record.to}>
        {record.to}
      </TableCell>
      <TableCell className="max-w-[16rem] truncate text-xs" title={record.subject}>
        {record.subject}
      </TableCell>
      <TableCell>
        <DeliveryStatusBadge status={record.status} />
      </TableCell>
      <TableCell className="text-center text-xs">
        {record.spamScore == null ? (
          <span className="text-muted-foreground/40">—</span>
        ) : (
          <span className={record.spamScore >= 5 ? 'font-semibold text-red-500' : ''}>
            {record.spamScore.toFixed(1)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-xs">{formatBytes(record.size)}</TableCell>
      <TableCell className="text-right text-xs text-muted-foreground/70">
        {timeAgo(record.timestamp)}
      </TableCell>
    </TableRow>
  );
}
