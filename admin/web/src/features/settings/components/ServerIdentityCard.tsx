import { Server, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ServerSettings } from '../settings.types';

/** Server identity: hostname (config/me) and SMTP greeting. */
export function ServerIdentityCard({ settings }: { settings: ServerSettings }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Server className="h-4 w-4 text-muted-foreground" />
          Server identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="space-y-1.5">
          <Label htmlFor="server-hostname" className="text-xs">
            Hostname (config/me)
          </Label>
          <Input id="server-hostname" defaultValue={settings.hostname} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="server-greeting" className="text-xs">
            SMTP greeting
          </Label>
          <Input id="server-greeting" defaultValue={settings.greeting} className="h-9 text-sm" />
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save identity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
