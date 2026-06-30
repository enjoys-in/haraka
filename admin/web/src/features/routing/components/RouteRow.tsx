import { Lock, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { TransportRoute } from '../routing.types';

interface RouteRowProps {
  route: TransportRoute;
  busy?: boolean;
  onRemove?: (domain: string) => void;
}

/** One outbound transport route row. */
export function RouteRow({ route, busy, onRemove }: RouteRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {route.isDefault ? (
          <span className="text-muted-foreground/70">* (default)</span>
        ) : (
          route.domain
        )}
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
      <TableCell className="text-right">
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            title={route.isDefault ? 'The default route cannot be removed' : 'Remove route'}
            disabled={route.isDefault || busy}
            onClick={() => onRemove(route.domain)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
