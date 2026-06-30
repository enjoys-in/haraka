import { ShieldCheck, ShieldBan, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccessRule } from '../access.types';

const SCOPE_LABELS: Record<AccessRule['scope'], string> = {
  connect: 'Connect',
  mail: 'MAIL FROM',
  rcpt: 'RCPT TO',
};

interface AccessRuleRowProps {
  rule: AccessRule;
  onRemove?: (rule: AccessRule) => void;
  busy?: boolean;
}

/** One access-control rule row. */
export function AccessRuleRow({ rule, onRemove, busy }: AccessRuleRowProps) {
  const allow = rule.action === 'allow';
  return (
    <TableRow>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            allow
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {allow ? <ShieldCheck className="h-3 w-3" /> : <ShieldBan className="h-3 w-3" />}
          {rule.action}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-[10px]">
          {SCOPE_LABELS[rule.scope]}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-xs">{rule.pattern}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          title="Remove rule"
          disabled={!onRemove || busy}
          onClick={() => onRemove?.(rule)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
