import { Network } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { ServiceStatus } from '../monitoring.types';

/** Table of probed service endpoints and their reachability. */
export function ServicesTable({
  services,
  loading,
}: {
  services: ServiceStatus[];
  loading?: boolean;
}) {
  const up = services.filter((s) => s.up).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="h-4 w-4 text-muted-foreground" />
          Services
        </CardTitle>
        <span className="text-xs text-muted-foreground/70">
          {up}/{services.length} up
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {services.length === 0 ? (
          <EmptyState
            icon={<Network className="h-8 w-8" />}
            title={loading ? 'Probing services…' : 'No services'}
            description="Probed service endpoints will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Host</TableHead>
                <TableHead className="text-center">Port</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.key}>
                  <TableCell className="text-xs font-medium">{service.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground/80">
                    {service.host}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{service.port}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        service.up
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'
                          : 'border-red-500/20 bg-red-500/10 text-[10px] font-semibold text-red-600 dark:text-red-400'
                      }
                    >
                      {service.up ? 'up' : 'down'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
