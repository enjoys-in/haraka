import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AliasAction } from '@/lib/types';

interface AddAliasFormProps {
  onAdd: (address: string, destinations: string[], action: AliasAction) => Promise<boolean>;
  busy?: boolean;
}

/** Form to add a new alias / forwarding rule (config/aliases). */
export function AddAliasForm({ onAdd, busy }: AddAliasFormProps) {
  const [address, setAddress] = useState('');
  const [destinations, setDestinations] = useState('');
  const [action, setAction] = useState<AliasAction>('alias');

  const submit = async () => {
    const dests = destinations
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const ok = await onAdd(address.trim(), dests, action);
    if (ok) {
      setAddress('');
      setDestinations('');
      setAction('alias');
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Add alias</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="alias-address" className="text-xs">
              Address
            </Label>
            <Input
              id="alias-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="info@airsend.in"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alias-dest" className="text-xs">
              Delivers to
            </Label>
            <Input
              id="alias-dest"
              value={destinations}
              onChange={(e) => setDestinations(e.target.value)}
              placeholder="user@domain (comma separated)"
              className="h-8 text-xs"
              disabled={action === 'drop'}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alias-action" className="text-xs">
              Action
            </Label>
            <select
              id="alias-action"
              value={action}
              onChange={(e) => setAction(e.target.value as AliasAction)}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
            >
              <option value="alias">Alias</option>
              <option value="continue">Continue</option>
              <option value="drop">Drop</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => void submit()}
              disabled={busy || !address.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
