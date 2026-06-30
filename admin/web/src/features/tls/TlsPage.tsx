import { useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  Lock,
  Upload,
  ShieldCheck,
  ShieldAlert,
  Save,
  Info,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { TlsStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageScroll } from '@/components/page';

export function TlsPage() {
  const { data, loading, error, setData } = useAsyncData(api.tls.get);
  const [cert, setCert] = useState('');
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const tls = data?.tls;

  async function saveCert() {
    if (!cert.trim() || !key.trim()) {
      toast.error('Paste or upload both the certificate and the private key');
      return;
    }
    setSaving(true);
    try {
      const res = await api.tls.saveCert(cert, key);
      setData(res);
      setCert('');
      setKey('');
      toast.success(`Certificate installed to config/${res.tls.certFile} — reloaded automatically`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to install certificate');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(enabled: boolean) {
    setToggling(true);
    try {
      const res = await api.tls.setEnabled(enabled);
      setData(res);
      toast.success(`TLS ${enabled ? 'enabled' : 'disabled'} — restart Haraka to apply`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update TLS');
    } finally {
      setToggling(false);
    }
  }

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#FFA724]" />
            TLS / SSL certificate
          </CardTitle>
          <CardDescription>
            Encrypt SMTP connections (STARTTLS). Install your own certificate and key, then enable
            the TLS plugin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {tls?.enabled ? (
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  TLS is {tls?.enabled ? 'enabled' : 'disabled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toggles the <code>tls</code> plugin in <code>config/plugins</code>. Requires a
                  Haraka restart to take effect.
                </p>
              </div>
            </div>
            <Switch
              checked={!!tls?.enabled}
              disabled={toggling || loading || !tls?.certExists}
              onCheckedChange={(v) => void toggle(v)}
            />
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <PageScroll>
        {tls && <CertStatusCard tls={tls} />}

        <Card>
          <CardHeader>
            <CardTitle>Install certificate</CardTitle>
            <CardDescription>
              Paste PEM text or upload a file. The certificate is written to{' '}
              <code>config/{tls?.certFile ?? 'tls_cert.pem'}</code> and the key to{' '}
              <code>config/{tls?.keyFile ?? 'tls_key.pem'}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#FFA724]" />
              <p>
                Use PEM-encoded files. The <strong className="text-foreground">certificate</strong>{' '}
                should include the full chain (your cert followed by any intermediates). The{' '}
                <strong className="text-foreground">private key</strong> must match the certificate
                and is never shown again after saving. Haraka reloads the cert automatically — no
                restart needed for renewals.
              </p>
            </div>

            <PemField
              label="Certificate (PEM)"
              accept=".pem,.crt,.cer,.cert,.txt"
              placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----"
              value={cert}
              onChange={setCert}
            />
            <PemField
              label="Private key (PEM)"
              accept=".pem,.key,.txt"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;…&#10;-----END PRIVATE KEY-----"
              value={key}
              onChange={setKey}
            />

            <div className="flex justify-end">
              <Button onClick={() => void saveCert()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Install certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageScroll>
    </Page>
  );
}

function CertStatusCard({ tls }: { tls: TlsStatus }) {
  const info = tls.info;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current certificate
          {info ? (
            info.expired ? (
              <Badge variant="destructive">expired</Badge>
            ) : info.daysRemaining <= 30 ? (
              <Badge variant="secondary">expires soon</Badge>
            ) : (
              <Badge variant="success">valid</Badge>
            )
          ) : (
            <Badge variant="outline">{tls.certExists ? 'unreadable' : 'none'}</Badge>
          )}
          {info?.selfSigned && <Badge variant="outline">self-signed</Badge>}
        </CardTitle>
        <CardDescription>
          Reading <code>config/{tls.certFile}</code> and <code>config/{tls.keyFile}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tls.certExists ? (
          <p className="text-sm text-muted-foreground">
            No certificate installed yet. Add one below to enable TLS.
          </p>
        ) : !info ? (
          <p className="text-sm text-muted-foreground">
            A file exists but could not be parsed as an X.509 certificate. Replace it below.
          </p>
        ) : (
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="Subject" value={info.subject} mono />
            <Field label="Issuer" value={info.issuer} mono />
            <Field
              label="Valid"
              value={
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                  {fmtDate(info.validFrom)} → {fmtDate(info.validTo)}
                  <span
                    className={
                      info.expired
                        ? 'text-destructive'
                        : info.daysRemaining <= 30
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                    }
                  >
                    ({info.expired ? 'expired' : `${info.daysRemaining} days left`})
                  </span>
                </span>
              }
            />
            <Field label="Private key" value={tls.keyExists ? 'present' : 'missing'} />
            {info.altNames.length > 0 && (
              <Field
                label="Subject alt names"
                value={info.altNames.join(', ')}
                mono
                className="sm:col-span-2"
              />
            )}
            <Field label="SHA-256 fingerprint" value={info.fingerprint} mono className="sm:col-span-2" />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {label}
      </dt>
      <dd className={`mt-0.5 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

function PemField({
  label,
  accept,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  accept: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    try {
      onChange(await file.text());
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error('Could not read the selected file');
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          Select file
        </Button>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}
