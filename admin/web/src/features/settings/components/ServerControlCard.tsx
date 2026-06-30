import { Power, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Process controls: reload config or restart the Haraka MTA. */
export function ServerControlCard() {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Power className="h-4 w-4 text-muted-foreground" />
          Server control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <p className="text-xs text-muted-foreground/70">
          Reload re-reads configuration without dropping connections. Restart fully cycles the
          process — required after enabling or disabling plugins.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Reload config
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <Power className="h-3.5 w-3.5" />
            Restart Haraka
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
