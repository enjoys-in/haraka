import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/** Form to add a new outbound route (smart host / relay). */
export function AddRouteForm() {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Add route</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="route-domain" className="text-xs">
              Domain
            </Label>
            <Input id="route-domain" placeholder="example.com or *" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="route-host" className="text-xs">
              Relay host
            </Label>
            <Input id="route-host" placeholder="relay.example.com" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="route-port" className="text-xs">
              Port
            </Label>
            <Input id="route-port" type="number" placeholder="587" className="h-8 text-xs" />
          </div>
          <div className="flex items-end">
            <Button size="sm" className="h-8 w-full gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add route
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
