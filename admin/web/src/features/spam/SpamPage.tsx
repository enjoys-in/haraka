import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { SpamSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Group = keyof SpamSettings;

const FIELDS: Record<Group, { key: string; label: string }[]> = {
  spamassassin: [
    { key: 'spamd_socket', label: 'spamd socket (host:port)' },
    { key: 'max_size', label: 'Max size (bytes)' },
    { key: 'reject_threshold', label: 'Reject threshold (score)' },
  ],
  rspamd: [
    { key: 'host', label: 'Host' },
    { key: 'port', label: 'Port' },
    { key: 'add_headers', label: 'Add headers (always/sometimes/never)' },
  ],
  clamd: [{ key: 'clamd_socket', label: 'clamd socket (host:port)' }],
};

const TITLES: Record<Group, string> = {
  spamassassin: 'SpamAssassin',
  rspamd: 'rspamd',
  clamd: 'ClamAV (clamd)',
};

export function SpamPage() {
  const { data, loading, error } = useAsyncData(api.spam.get);
  const [form, setForm] = useState<SpamSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data.settings);
  }, [data]);

  function update(group: Group, key: string, value: string) {
    setForm((f) =>
      f ? { ...f, [group]: { ...f[group], [key]: value } } : f
    );
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      await api.spam.set(form);
      toast.success('Spam settings saved — restart Haraka to apply');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {form &&
        (Object.keys(FIELDS) as Group[]).map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{TITLES[group]}</CardTitle>
              <CardDescription>config/{group}.ini</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {FIELDS[group].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label>{field.label}</Label>
                  <Input
                    value={(form[group] as Record<string, string>)[field.key] ?? ''}
                    onChange={(e) => update(group, field.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

      {form && (
        <Button onClick={() => void save()} disabled={saving}>
          <Save className="h-4 w-4" />
          Save spam settings
        </Button>
      )}
    </div>
  );
}
