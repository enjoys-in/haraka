import { Network } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { LiveConnection } from '../monitoring.types';
import { ConnectionRow } from './ConnectionRow';

/** Watch-style table of every currently open SMTP connection. */
export function ConnectionsTable({ connections }: { connections: LiveConnection[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="h-4 w-4 text-muted-foreground" />
          Live connections
        </CardTitle>
        <span className="text-xs text-muted-foreground/70">{connections.length} open</span>
      </CardHeader>
      <CardContent className="p-0">
        {connections.length === 0 ? (
          <EmptyState
            icon={<Network className="h-8 w-8" />}
            title="No active connections"
            description="Live SMTP sessions will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dir</TableHead>
                <TableHead>Remote</TableHead>
                <TableHead>HELO</TableHead>
                <TableHead>MAIL FROM</TableHead>
                <TableHead className="text-center">Rcpt</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-center">TLS</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <ConnectionRow key={connection.id} connection={connection} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
