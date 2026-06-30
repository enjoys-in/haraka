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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Page, PageScroll } from '@/components/page';

interface DnsRecord {
  badge: string;
  type: 'MX' | 'A' | 'TXT' | 'PTR';
  name: string;
  value: string;
  priority?: number;
  required: boolean;
  description: string;
}

// Build the complete set of DNS records an operator needs to publish for a
// domain, derived from the generated DKIM key. Names are shown relative to the
// zone root (use "@" for the apex).
function buildDnsRecords(detail: DkimDetail): DnsRecord[] {
  const domain = detail.dkim.domain;
  const selector = detail.dkim.selector;
  const mailHost = `mail.${domain}`;
  const stsId = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return [
    {
      badge: 'MX',
      type: 'MX',
      name: '@',
      value: mailHost,
      priority: 10,
      required: true,
      description: `Routes inbound mail for ${domain} to your server. Replace ${mailHost} with your server's hostname if it differs.`,
    },
    {
      badge: 'A',
      type: 'A',
      name: 'mail',
      value: '<your-server-IPv4>',
      required: true,
      description: `Resolves ${mailHost} to your server's public IP. Add an AAAA record too if you have IPv6.`,
    },
    {
      badge: 'SPF',
      type: 'TXT',
      name: '@',
      value: 'v=spf1 mx a -all',
      required: true,
      description: 'Authorises this server (its MX/A hosts) to send for the domain and rejects everything else.',
    },
    {
      badge: 'DKIM',
      type: 'TXT',
      name: `${selector}._domainkey`,
      value: detail.dkim.dnsValue,
      required: true,
      description: 'Public key used to sign outbound mail — must match the local private key.',
    },
    {
      badge: 'DMARC',
      type: 'TXT',
      name: '_dmarc',
      value: `v=DMARC1; p=reject; adkim=s; aspf=r; rua=mailto:dmarc-feedback@${domain}; pct=100`,
      required: false,
      description: 'Tells receivers how to handle SPF/DKIM failures and where to send aggregate reports.',
    },
    {
      badge: 'MTA-STS',
      type: 'TXT',
      name: '_mta-sts',
      value: `v=STSv1; id=${stsId}`,
      required: false,
      description: `Enforces TLS for inbound mail. Also host a policy at https://mta-sts.${domain}/.well-known/mta-sts.txt and add an A/CNAME for mta-sts.${domain}.`,
    },
    {
      badge: 'TLS-RPT',
      type: 'TXT',
      name: '_smtp._tls',
      value: `v=TLSRPTv1; rua=mailto:tls-reports@${domain}`,
      required: false,
      description: 'Where receivers send reports about TLS connection problems (pairs with MTA-STS).',
    },
    {
      badge: 'PTR',
      type: 'PTR',
      name: '<reverse zone of server IP>',
      value: mailHost,
      required: false,
      description: 'Reverse DNS for the server IP. Set this at your hosting/IP provider, not your domain registrar.',
    },
  ];
}

function recordsToZoneText(records: DnsRecord[]): string {
  return records
    .map((r) => {
      if (r.type === 'MX') return `@\tIN\tMX\t${r.priority}\t${r.value}.`;
      if (r.type === 'TXT') return `${r.name}\tIN\tTXT\t"${r.value}"`;
      if (r.type === 'PTR') return `; PTR (set at IP provider): ${r.value}`;
      return `${r.name}\tIN\t${r.type}\t${r.value}`;
    })
    .join('\n');
}

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
    <Page>
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
            <Select
              value={String(keySize)}
              onValueChange={(v) => setKeySize(Number(v))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024">1024</SelectItem>
                <SelectItem value="2048">2048</SelectItem>
                <SelectItem value="4096">4096</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void generate()} disabled={generating}>
            <KeyRound className="h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>

      <PageScroll>
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

      {detail &&
        (() => {
          const records = buildDnsRecords(detail);
          const requiredCount = records.filter((r) => r.required).length;
          const recommendedCount = records.length - requiredCount;
          return (
            <Card>
              <CardHeader>
                <CardTitle>DNS records to add — {detail.dkim.domain}</CardTitle>
                <CardDescription>
                  Add these <strong>{records.length}</strong> records at your DNS provider:{' '}
                  <strong>{requiredCount} required</strong> (MX, A, SPF, DKIM) to make mail work, and{' '}
                  <strong>{recommendedCount} recommended</strong> (DMARC, MTA-STS, TLS-RPT, PTR) for
                  deliverability &amp; security. Names are relative to{' '}
                  <span className="font-mono">{detail.dkim.domain}</span> — use{' '}
                  <span className="font-mono">@</span> for the apex; some registrars want the full
                  name (append <span className="font-mono">.{detail.dkim.domain}</span>). After
                  publishing, click <strong>Verify</strong> above. DNS changes can take time to
                  propagate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {records.map((r, i) => (
                  <div key={r.badge} className="space-y-2 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{i + 1}.</span>
                      <Badge variant="secondary" className="font-mono">
                        {r.badge}
                      </Badge>
                      <Badge variant={r.required ? 'success' : 'outline'}>
                        {r.required ? 'required' : 'recommended'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Type {r.type}
                        {r.priority != null ? ` · priority ${r.priority}` : ''}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[140px_1fr_auto] sm:items-start">
                      <div className="text-xs">
                        <div className="text-muted-foreground">Name / Host</div>
                        <div className="break-all font-mono">{r.name}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-muted-foreground">Value</div>
                        <code className="block break-all rounded bg-muted px-2 py-1 font-mono">
                          {r.value}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Copy value"
                        onClick={() => copy(r.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                ))}
                <details>
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Raw BIND zone snippet (copy all)
                  </summary>
                  <div className="mt-2 flex items-start gap-2">
                    <pre className="flex-1 overflow-auto rounded-md bg-muted p-3 text-xs">
                      {recordsToZoneText(records)}
                    </pre>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Copy zone snippet"
                      onClick={() => copy(recordsToZoneText(records))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })()}
      </PageScroll>
    </Page>
  );
}
