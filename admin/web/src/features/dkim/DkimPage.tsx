import { useState } from 'react';
import { Copy, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { DkimDetail, DkimVerifyResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DkimPage() {
  const { data, loading, error, reload, setData } = useAsyncData(api.dkim.list);
  const [domain, setDomain] = useState('');
  const [selector, setSelector] = useState('');
  const [keySize, setKeySize] = useState(2048);
  const [generating, setGenerating] = useState(false);
  const [detail, setDetail] = useState<DkimDetail | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, DkimVerifyResult>>({});

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  async function generate() {
    if (!domain.trim()) {
      toast.error('Domain is required');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.dkim.generate(domain.trim(), selector.trim() || undefined, keySize);
      setDetail(res);
      setDomain('');
      setSelector('');
      await reload();
      toast.success(`DKIM key generated for ${res.dkim.domain}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate key');
    } finally {
      setGenerating(false);
    }
  }

  async function verify(d: string) {
    setVerifying(d);
    try {
      const { result } = await api.dkim.verify(d);
      setResults((r) => ({ ...r, [d]: result }));
      result.match ? toast.success(result.message) : toast.warning(result.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setVerifying(null);
    }
  }

  async function remove(d: string) {
    try {
      const res = await api.dkim.remove(d);
      setData(res);
      if (detail?.dkim.domain === d) setDetail(null);
      toast.success(`Removed DKIM key for ${d}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove key');
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate DKIM key</CardTitle>
          <CardDescription>
            Creates config/dkim/&lt;domain&gt;/&#123;private, public, selector, dns&#125; and signs
            outbound mail (dkim plugin). Restart Haraka after generating.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[2fr_1fr_auto_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Domain</Label>
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Selector (optional)</Label>
            <Input
              placeholder="auto (e.g. jun2026)"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Key size</Label>
            <select
              value={keySize}
              onChange={(e) => setKeySize(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value={1024}>1024</option>
              <option value={2048}>2048</option>
              <option value={4096}>4096</option>
            </select>
          </div>
          <Button onClick={() => void generate()} disabled={generating}>
            <KeyRound className="h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DKIM keys</CardTitle>
          <CardDescription>Existing signing keys and DNS verification status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Selector</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.domains.map((d) => {
                const r = results[d.domain];
                return (
                  <TableRow key={d.domain}>
                    <TableCell className="font-mono text-sm">{d.domain}</TableCell>
                    <TableCell className="font-mono text-sm">{d.selector}</TableCell>
                    <TableCell>
                      <Badge variant={d.hasPrivateKey ? 'success' : 'destructive'}>
                        {d.hasPrivateKey ? 'private ok' : 'no private'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r ? (
                        <Badge variant={r.match ? 'success' : r.found ? 'secondary' : 'outline'}>
                          {r.match ? 'verified' : r.found ? 'mismatch' : 'not found'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void api.dkim.get(d.domain).then(setDetail)}
                      >
                        DNS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void verify(d.domain)}
                        disabled={verifying === d.domain}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void remove(d.domain)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data && data.domains.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No DKIM keys yet — generate one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {detail && (
        <Card>
          <CardHeader>
            <CardTitle>DNS record — {detail.dkim.domain}</CardTitle>
            <CardDescription>
              Publish this TXT record, then click Verify. DNS changes can take time to propagate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Host / Name</Label>
              <div className="flex gap-2">
                <Input readOnly value={detail.dkim.dnsName} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copy(detail.dkim.dnsName)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Value (TXT)</Label>
              <div className="flex gap-2">
                <textarea
                  readOnly
                  value={detail.dkim.dnsValue}
                  className="h-24 w-full rounded-md border border-input bg-transparent p-2 font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={() => copy(detail.dkim.dnsValue)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Full instructions (SPF / DMARC / BIND)
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs">
                {detail.instructions}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
