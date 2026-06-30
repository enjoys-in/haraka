import { ArrowRight, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MailAlias } from '../aliases.types';

const ACTION_LABELS: Record<MailAlias['action'], string> = {
  alias: 'Alias',
  drop: 'Drop',
  continue: 'Continue',
};

interface AliasRowProps {
  alias: MailAlias;
  busy?: boolean;
  onRemove?: (address: string) => void;
}

/** One alias / forwarding rule row. */
export function AliasRow({ alias, busy, onRemove }: AliasRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{alias.address}</TableCell>
      <TableCell>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
      </TableCell>
      <TableCell className="text-xs">
        {alias.destinations.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {alias.destinations.map((destination) => (
              <span
                key={destination}
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
              >
                {destination}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-[10px]">
          {ACTION_LABELS[alias.action]}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            title="Remove alias"
            disabled={busy}
            onClick={() => onRemove(alias.address)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
