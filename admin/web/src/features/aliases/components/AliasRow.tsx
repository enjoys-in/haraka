import { ArrowRight, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { MailAlias } from '../aliases.types';

const TYPE_LABELS: Record<MailAlias['type'], string> = {
  alias: 'Alias',
  forward: 'Forward',
  catchall: 'Catch-all',
};

/** One alias / forwarding rule row. */
export function AliasRow({ alias }: { alias: MailAlias }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{alias.address}</TableCell>
      <TableCell>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
      </TableCell>
      <TableCell className="text-xs">
        <div className="flex flex-wrap gap-1">
          {alias.destinations.map((destination) => (
            <span key={destination} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
              {destination}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-[10px]">
          {TYPE_LABELS[alias.type]}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Switch defaultChecked={alias.enabled} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          title="Remove alias"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
