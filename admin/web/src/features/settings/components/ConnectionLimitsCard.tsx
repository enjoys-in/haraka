import { Gauge, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { ServerSettings } from '../settings.types';

/** Connection limits and timeouts (connection.ini / smtp.ini). */
export function ConnectionLimitsCard({ settings }: { settings: ServerSettings }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          Connection limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="max-conn" className="text-xs">
              Max connections
            </Label>
            <Input
              id="max-conn"
              type="number"
              defaultValue={settings.maxConnections}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max-conn-host" className="text-xs">
              Max per host
            </Label>
            <Input
              id="max-conn-host"
              type="number"
              defaultValue={settings.maxConnectionsPerHost}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max-size" className="text-xs">
              Max message size (MB)
            </Label>
            <Input
              id="max-size"
              type="number"
              defaultValue={settings.maxMessageSizeMb}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="data-timeout" className="text-xs">
              DATA timeout (sec)
            </Label>
            <Input
              id="data-timeout"
              type="number"
              defaultValue={settings.dataTimeoutSec}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Require TLS</p>
            <p className="text-xs text-muted-foreground/70">Reject plaintext sessions</p>
          </div>
          <Switch defaultChecked={settings.tlsRequired} />
        </div>

        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save limits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
