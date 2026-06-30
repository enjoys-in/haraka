import { Forward } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { MailAlias } from '../aliases.types';
import { AliasRow } from './AliasRow';

interface AliasTableProps {
  aliases: MailAlias[];
  loading?: boolean;
  busy?: boolean;
  onRemove?: (address: string) => void;
}

/** Table of alias / forwarding rules. */
export function AliasTable({ aliases, loading, busy, onRemove }: AliasTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {aliases.length === 0 ? (
          <EmptyState
            icon={<Forward className="h-8 w-8" />}
            title={loading ? 'Loading aliases…' : 'No aliases'}
            description="Forwarding and catch-all rules will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="w-8" />
                <TableHead>Delivers to</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aliases.map((alias) => (
                <AliasRow key={alias.id} alias={alias} busy={busy} onRemove={onRemove} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
