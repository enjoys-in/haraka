import { Lock, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TransportRoute } from '../routing.types';

const TYPE_LABELS: Record<TransportRoute['type'], string> = {
  mx: 'MX lookup',
  smarthost: 'Smart host',
  lmtp: 'LMTP',
};

/** One outbound transport route row. */
export function RouteRow({ route }: { route: TransportRoute }) {
  const isDefault = route.domain === '*';
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {isDefault ? <span className="text-muted-foreground/70">* (default)</span> : route.domain}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-[10px]">
          {TYPE_LABELS[route.type]}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-xs">{route.host}</TableCell>
      <TableCell className="text-center font-mono text-xs">{route.port}</TableCell>
      <TableCell className="text-center text-xs">
        {route.auth ? 'yes' : <span className="text-muted-foreground/40">no</span>}
      </TableCell>
      <TableCell className="text-center">
        {route.tls ? (
          <Lock className="mx-auto h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </TableCell>
      <TableCell className="text-center text-xs">{route.priority}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          title="Remove route"
          disabled={isDefault}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
