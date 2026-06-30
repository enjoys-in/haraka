import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/** Form to add a new alias / forwarding rule. */
export function AddAliasForm() {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Add alias</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="alias-address" className="text-xs">
              Address
            </Label>
            <Input id="alias-address" placeholder="info@cirrusmail.cloud" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alias-dest" className="text-xs">
              Delivers to
            </Label>
            <Input
              id="alias-dest"
              placeholder="user@domain (comma separated)"
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-end">
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
