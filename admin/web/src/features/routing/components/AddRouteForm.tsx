import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface AddRouteFormProps {
  onAdd: (domain: string, host: string, port: number, tls: boolean) => Promise<boolean>;
  busy?: boolean;
}

/** Form to add a new outbound route (smart host / relay). */
export function AddRouteForm({ onAdd, busy }: AddRouteFormProps) {
  const [domain, setDomain] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [tls, setTls] = useState(false);

  const submit = async () => {
    const ok = await onAdd(domain.trim(), host.trim(), Number(port) || 25, tls);
    if (ok) {
      setDomain('');
      setHost('');
      setPort('587');
      setTls(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Add route</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="route-domain" className="text-xs">
              Domain
            </Label>
            <Input
              id="route-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com or *"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="route-host" className="text-xs">
              Relay host
            </Label>
            <Input
              id="route-host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="relay.example.com"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="route-port" className="text-xs">
              Port
            </Label>
            <Input
              id="route-port"
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="587"
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch id="route-tls" checked={tls} onCheckedChange={setTls} />
            <Label htmlFor="route-tls" className="text-xs">
              TLS
            </Label>
          </div>
          <div className="flex items-end">
            <Button
              size="sm"
              className="h-8 w-full gap-1.5 text-xs"
              onClick={() => void submit()}
              disabled={busy || !domain.trim() || !host.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add route
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
