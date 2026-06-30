import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DomainsPage() {
  const { data, loading, error, setData } = useAsyncData(api.domains.list);
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!domain.trim()) return;
    setBusy(true);
    try {
      const res = await api.domains.add(domain.trim());
      setData(res);
      setDomain('');
      toast.success('Domain added');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add domain');
    } finally {
      setBusy(false);
    }
  }

  async function remove(target: string) {
    try {
      setData(await api.domains.remove(target));
      toast.success(`Removed ${target}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove domain');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accepted domains</CardTitle>
        <CardDescription>
          Domains Haraka accepts mail for (config/host_list, used by rcpt_to.in_host_list).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void add()}
          />
          <Button onClick={() => void add()} disabled={busy}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.domains.map((d) => (
              <TableRow key={d}>
                <TableCell className="font-mono text-sm">{d}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => void remove(d)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data && data.domains.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-sm text-muted-foreground">
                  No domains configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
