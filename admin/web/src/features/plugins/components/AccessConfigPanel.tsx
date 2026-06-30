import { Info, Loader2, Lock } from 'lucide-react';
import { AddAccessRuleForm } from '@/features/access/components/AddAccessRuleForm';
import { AccessRuleTable } from '@/features/access/components/AccessRuleTable';
import { useAccessRules } from '@/features/access/useAccessRules';
import type { AccessRule } from '@/features/access/access.types';

/**
 * Inline ACL manager shown when configuring the `access` plugin — lets the user
 * control allow/deny rules by rDNS host, MAIL FROM or RCPT TO, backed by the
 * plugin's real list files. Editing is only active while the plugin is enabled.
 */
export function AccessConfigPanel({ enabled }: { enabled: boolean }) {
  const { acl, loading, busy, error, add, remove } = useAccessRules();

  const handleRemove = (rule: AccessRule) => void remove(rule.scope, rule.action, rule.pattern);

  return (
    <div className="space-y-3 border-t border-border/40 px-3 py-3">
      {enabled ? (
        <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFA724]" />
          <p>
            Allow or deny senders by rDNS host, MAIL FROM or RCPT TO. Rules are written to the
            access plugin&apos;s list files and enforced while it is enabled.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-400">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            The access plugin is disabled. Enable it to add or remove rules — existing rules are
            shown read-only below.
          </p>
        </div>
      )}

      {error ? (
        <p className="px-1 text-[11px] text-destructive">{error}</p>
      ) : loading ? (
        <div className="flex items-center gap-2 px-1 py-3 text-[11px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading access rules…
        </div>
      ) : (
        <>
          <AddAccessRuleForm onAdd={add} disabled={!enabled} busy={busy} />
          <AccessRuleTable
            rules={acl.rules}
            onRemove={enabled ? handleRemove : undefined}
            busy={busy}
          />
        </>
      )}
    </div>
  );
}
