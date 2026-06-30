import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageScroll } from '@/components/page';

type Row = { key: string; value: string };

export function SmtpPage() {
  const { data, loading, error } = useAsyncData(api.smtp.get);
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setRows(Object.entries(data.values).map(([key, value]) => ({ key, value })));
  }, [data]);

  function update(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function save() {
    setSaving(true);
    try {
      const values: Record<string, string> = {};
      for (const { key, value } of rows) if (key.trim()) values[key.trim()] = value;
      await api.smtp.set(values);
      toast.success('smtp.ini saved — restart Haraka to apply');
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
          <CardTitle>SMTP settings</CardTitle>
          <CardDescription>Top-level keys in config/smtp.ini (e.g. listen, nodes).</CardDescription>
        </CardHeader>
      </Card>

      <PageScroll>
        <Card>
          <CardContent className="space-y-3 pt-6">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr] gap-2">
                <Input
                  value={row.key}
                  placeholder="key"
                  onChange={(e) => update(i, { key: e.target.value })}
                />
                <Input
                  value={row.value}
                  placeholder="value"
                  onChange={(e) => update(i, { value: e.target.value })}
                />
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRows((r) => [...r, { key: '', value: '' }])}
              >
                <Plus className="h-4 w-4" />
                Add field
              </Button>
              <Button size="sm" onClick={() => void save()} disabled={saving}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
            <Label className="text-xs text-muted-foreground">
              New keys are appended; existing comments are preserved.
            </Label>
          </CardContent>
        </Card>
      </PageScroll>
    </Page>
  );
}
