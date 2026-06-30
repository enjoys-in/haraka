import { ArrowDownToLine, ArrowUpFromLine, Lock } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatBytes, timeAgo } from '@/lib/format';
import type { LiveConnection } from '../monitoring.types';

/** A single live SMTP connection row. */
export function ConnectionRow({ connection }: { connection: LiveConnection }) {
  const inbound = connection.direction === 'inbound';
  return (
    <TableRow>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            inbound
              ? 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400'
              : 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400'
          }`}
        >
          {inbound ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
          {inbound ? 'in' : 'out'}
        </span>
      </TableCell>
      <TableCell className="font-mono text-xs">
        <div>{connection.remoteIp}</div>
        {connection.remoteHost && (
          <div className="text-muted-foreground/70">{connection.remoteHost}</div>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs">{connection.helo ?? '—'}</TableCell>
      <TableCell className="max-w-[14rem] truncate font-mono text-xs" title={connection.mailFrom ?? ''}>
        {connection.mailFrom ?? '—'}
      </TableCell>
      <TableCell className="text-center text-xs">{connection.rcptCount}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono text-[10px]">
          {connection.state}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        {connection.tls ? (
          <Lock className="mx-auto h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-xs">{formatBytes(connection.bytes)}</TableCell>
      <TableCell className="text-right text-xs text-muted-foreground/70">
        {timeAgo(connection.startedAt)}
      </TableCell>
    </TableRow>
  );
}
