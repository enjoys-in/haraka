import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/** Form to add an allow / deny access rule. */
export function AddAccessRuleForm() {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Add rule</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="access-pattern" className="text-xs">
              Pattern
            </Label>
            <Input id="access-pattern" placeholder="IP / CIDR / domain" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="access-comment" className="text-xs">
              Comment
            </Label>
            <Input id="access-comment" placeholder="Optional note" className="h-8 text-xs" />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Allow
            </Button>
            <Button variant="destructive" size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Deny
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
