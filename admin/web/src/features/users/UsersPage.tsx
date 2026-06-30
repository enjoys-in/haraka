import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function UsersPage() {
  const { data, loading, error, setData } = useAsyncData(api.users.list);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    setBusy(true);
    try {
      const res = await api.users.upsert(email, password);
      setData(res);
      setEmail('');
      setPassword('');
      toast.success('User saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save user');
    } finally {
      setBusy(false);
    }
  }

  async function remove(target: string) {
    try {
      setData(await api.users.remove(target));
      toast.success(`Removed ${target}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove user');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP users</CardTitle>
        <CardDescription>
          AUTH accounts in config/auth_flat_file.ini. Passwords are stored as plaintext
          (flat_file compares plaintext) — always require TLS in production.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[2fr_2fr_auto]">
          <Input
            type="email"
            placeholder="user@cirrusmail.cloud"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="text"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={() => void add()} disabled={busy}>
            <UserPlus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((u) => (
              <TableRow key={u.email}>
                <TableCell className="font-mono text-sm">{u.email}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => void remove(u.email)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data && data.users.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-sm text-muted-foreground">
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
