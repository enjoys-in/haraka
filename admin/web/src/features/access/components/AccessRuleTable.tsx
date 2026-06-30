import { ShieldBan } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { AccessRule } from '../access.types';
import { AccessRuleRow } from './AccessRuleRow';

/** Table of access-control (allow/deny) rules. */
export function AccessRuleTable({ rules }: { rules: AccessRule[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        {rules.length === 0 ? (
          <EmptyState
            icon={<ShieldBan className="h-8 w-8" />}
            title="No access rules"
            description="Allow and deny rules will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="text-right">Hits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <AccessRuleRow key={rule.id} rule={rule} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
