import { Pencil, Trash2, Mail } from 'lucide-react';
import type { AuthUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UsersTableProps {
  users: AuthUser[];
  loading: boolean;
  error: string | null;
  editingEmail: string;
  onEdit: (user: AuthUser) => void;
  onRemove: (email: string) => void;
}

export function UsersTable({ users, loading, error, editingEmail, onEdit, onRemove }: UsersTableProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Accounts</CardTitle>
        <Badge variant="secondary" className="px-2 py-0 text-[11px]">{users.length} total</Badge>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Aliases</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email} data-active={u.email === editingEmail || undefined} className="data-[active=true]:bg-muted/50">
                <TableCell className="font-mono text-sm">
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {u.email}
                  </span>
                </TableCell>
                <TableCell>
                  {u.aliases.length ? (
                    <div className="flex flex-wrap gap-1">
                      {u.aliases.map((a) => (
                        <Badge key={a} variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(u)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemove(u.email)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-sm text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
