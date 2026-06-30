import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AccessAction, AccessScope } from '../access.types';

const SCOPES: { value: AccessScope; label: string }[] = [
  { value: 'connect', label: 'Connect (rDNS)' },
  { value: 'mail', label: 'MAIL FROM' },
  { value: 'rcpt', label: 'RCPT TO' },
];

interface AddAccessRuleFormProps {
  onAdd?: (scope: AccessScope, action: AccessAction, pattern: string) => Promise<boolean> | void;
  disabled?: boolean;
  busy?: boolean;
}

/** Form to add an allow / deny access rule for a chosen SMTP phase. */
export function AddAccessRuleForm({ onAdd, disabled, busy }: AddAccessRuleFormProps) {
  const [scope, setScope] = useState<AccessScope>('connect');
  const [pattern, setPattern] = useState('');

  const submit = async (action: AccessAction) => {
    const value = pattern.trim();
    if (!value || !onAdd) return;
    const ok = await onAdd(scope, action, value);
    if (ok) setPattern('');
  };

  const locked = disabled || busy;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Add rule</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="access-scope" className="text-xs">
              Phase
            </Label>
            <Select
              value={scope}
              onValueChange={(v) => setScope(v as AccessScope)}
              disabled={locked}
            >
              <SelectTrigger id="access-scope" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="access-pattern" className="text-xs">
              Pattern
            </Label>
            <Input
              id="access-pattern"
              placeholder="IP / CIDR / rDNS host / domain / address"
              className="h-8 text-xs"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              disabled={locked}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit('allow');
              }}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={locked || !pattern.trim()}
              onClick={() => void submit('allow')}
            >
              Allow
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={locked || !pattern.trim()}
              onClick={() => void submit('deny')}
            >
              <Plus className="h-3.5 w-3.5" />
              Deny
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
