import { ShieldAlert } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { QuarantinedMessage } from '../quarantine.types';
import { QuarantineRow } from './QuarantineRow';

/** Table of quarantined messages awaiting review. */
export function QuarantineTable({
  messages,
  loading,
}: {
  messages: QuarantinedMessage[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {messages.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8" />}
            title={loading ? 'Loading quarantine…' : 'Quarantine is empty'}
            description="Held messages awaiting review will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <QuarantineRow key={message.id} message={message} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
