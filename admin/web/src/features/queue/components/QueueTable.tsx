import { Mails } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { QueuedMessage } from '../queue.types';
import { QueueRow } from './QueueRow';

/** Table of outbound queue messages. */
export function QueueTable({ messages }: { messages: QueuedMessage[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Mails className="h-4 w-4 text-muted-foreground" />
          Messages
        </CardTitle>
        <span className="text-xs text-muted-foreground/70">{messages.length} shown</span>
      </CardHeader>
      <CardContent className="p-0">
        {messages.length === 0 ? (
          <EmptyState
            icon={<Mails className="h-8 w-8" />}
            title="Queue is empty"
            description="Outbound messages awaiting delivery appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-center">Tries</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Next try</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <QueueRow key={message.id} message={message} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
