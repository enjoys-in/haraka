import { Mail } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { MailRecord } from '../mailHistory.types';
import { MailHistoryRow } from './MailHistoryRow';

/** Table of recent message deliveries. */
export function MailHistoryTable({ records }: { records: MailRecord[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        {records.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-8 w-8" />}
            title="No messages yet"
            description="Sent and received mail will be listed here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Dir</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Spam</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <MailHistoryRow key={record.id} record={record} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
