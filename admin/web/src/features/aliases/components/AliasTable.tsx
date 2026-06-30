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

/** Table of alias / forwarding rules. */
export function AliasTable({ aliases }: { aliases: MailAlias[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        {aliases.length === 0 ? (
          <EmptyState
            icon={<Forward className="h-8 w-8" />}
            title="No aliases"
            description="Forwarding and catch-all rules will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="w-8" />
                <TableHead>Delivers to</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aliases.map((alias) => (
                <AliasRow key={alias.id} alias={alias} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
