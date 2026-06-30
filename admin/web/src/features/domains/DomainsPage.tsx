import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Page, PageScroll } from '@/components/page';

export function DomainsPage() {
  const { data, loading, error, setData } = useAsyncData(api.domains.list);
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

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

  const query = search.trim().toLowerCase();
  const filtered = data?.domains.filter((d) => d.toLowerCase().includes(query)) ?? [];

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>Accepted domains</CardTitle>
          <CardDescription>
            Domains Haraka accepts mail for (config/host_list, used by rcpt_to.in_host_list).
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <PageScroll>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Card>
          <CardContent className="pt-6">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search domains…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d}>
                    <TableCell className="font-mono text-sm">{d}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => void remove(d)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground">
                      {data.domains.length === 0
                        ? 'No domains configured.'
                        : `No domains match “${search.trim()}”.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageScroll>
    </Page>
  );
}
