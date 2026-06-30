import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageScroll } from '@/components/page';

function preview(hostname: string, greeting: string, includeUuid: boolean): string {
  const tail = greeting.trim() || 'Haraka ready';
  const host = hostname.trim() || 'mail.example.com';
  return `220 ${host} ESMTP ${tail}${includeUuid ? ' (a1b2c3)' : ''}`;
}

export function BannerPage() {
  const { data, loading, error } = useAsyncData(api.banner.get);
  const [hostname, setHostname] = useState('');
  const [greeting, setGreeting] = useState('');
  const [includeUuid, setIncludeUuid] = useState(true);
  const [bannerChars, setBannerChars] = useState(6);
  const [showVersion, setShowVersion] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setHostname(data.banner.hostname);
    setGreeting(data.banner.greeting);
    setIncludeUuid(data.banner.bannerChars > 0);
    setBannerChars(data.banner.bannerChars || 6);
    setShowVersion(data.banner.showVersion);
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await api.banner.set({
        hostname: hostname.trim(),
        greeting: greeting.trim(),
        bannerChars: includeUuid ? (bannerChars > 0 ? bannerChars : 6) : 0,
        showVersion,
      });
      toast.success('Banner saved — restart Haraka to apply');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>Banner & White-labeling</CardTitle>
          <CardDescription>
            Customize the SMTP 220 greeting clients see on connect, and hide the underlying server
            software for white-label deployments.
          </CardDescription>
        </CardHeader>
      </Card>

      <PageScroll>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Live preview
            </Label>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 font-mono text-sm text-[#FFA724]">
              {preview(hostname, greeting, includeUuid)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 pt-6">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                value={hostname}
                placeholder="mail.example.com"
                onChange={(e) => setHostname(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Appears right after <code>220</code>. Stored in config/me.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting (banner text)</Label>
              <Input
                id="greeting"
                value={greeting}
                placeholder="Mail Service"
                onChange={(e) => setGreeting(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Replaces the default “Haraka …” text. Leave empty to fall back to the default, which
                reveals the server software. Stored in connection.ini [message] greeting.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div className="space-y-0.5 pr-4">
                <Label>Append connection ID to banner</Label>
                <p className="text-xs text-muted-foreground">
                  Adds a short tracing UUID like (a1b2c3) to the greeting.
                </p>
              </div>
              <Switch checked={includeUuid} onCheckedChange={setIncludeUuid} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div className="space-y-0.5 pr-4">
                <Label>Expose server version in headers</Label>
                <p className="text-xs text-muted-foreground">
                  Turn off to strip the software version from Received headers — recommended for
                  white-labeling.
                </p>
              </div>
              <Switch checked={showVersion} onCheckedChange={setShowVersion} />
            </div>

            <Button size="sm" onClick={() => void save()} disabled={saving || loading}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardContent>
        </Card>
      </PageScroll>
    </Page>
  );
}
