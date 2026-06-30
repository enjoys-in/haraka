import { Route as RouteIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { TransportRoute } from '../routing.types';
import { RouteRow } from './RouteRow';

interface RouteTableProps {
  routes: TransportRoute[];
  loading?: boolean;
  busy?: boolean;
  onRemove?: (domain: string) => void;
}

/** Table of outbound transport routes. */
export function RouteTable({ routes, loading, busy, onRemove }: RouteTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {routes.length === 0 ? (
          <EmptyState
            icon={<RouteIcon className="h-8 w-8" />}
            title={loading ? 'Loading routes…' : 'No routes defined'}
            description="Mail uses direct MX delivery until routes are added."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Host</TableHead>
                <TableHead className="text-center">Port</TableHead>
                <TableHead className="text-center">Auth</TableHead>
                <TableHead className="text-center">TLS</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <RouteRow key={route.id} route={route} busy={busy} onRemove={onRemove} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
