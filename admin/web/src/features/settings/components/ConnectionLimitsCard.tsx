import { useState } from 'react';
import { Gauge, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ServerSettings } from '../settings.types';

interface ConnectionLimitsCardProps {
  settings: ServerSettings;
  busy?: boolean;
  onSave: (input: Partial<ServerSettings>) => Promise<boolean>;
}

/** Message size (connection.ini) and inactivity timeout (smtp.ini). */
export function ConnectionLimitsCard({ settings, busy, onSave }: ConnectionLimitsCardProps) {
  const [maxMessageSizeMb, setMaxMessageSizeMb] = useState(String(settings.maxMessageSizeMb));
  const [inactivityTimeoutSec, setInactivityTimeoutSec] = useState(
    String(settings.inactivityTimeoutSec),
  );

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          Limits &amp; timeouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="max-size" className="text-xs">
              Max message size (MB)
            </Label>
            <Input
              id="max-size"
              type="number"
              value={maxMessageSizeMb}
              onChange={(e) => setMaxMessageSizeMb(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inactivity-timeout" className="text-xs">
              Inactivity timeout (sec)
            </Label>
            <Input
              id="inactivity-timeout"
              type="number"
              value={inactivityTimeoutSec}
              onChange={(e) => setInactivityTimeoutSec(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={() =>
              void onSave({
                maxMessageSizeMb: Number(maxMessageSizeMb),
                inactivityTimeoutSec: Number(inactivityTimeoutSec),
              })
            }
          >
            <Save className="h-3.5 w-3.5" />
            Save limits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
