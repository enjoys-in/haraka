import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { AddAccessRuleForm } from './components/AddAccessRuleForm';
import { AccessRuleTable } from './components/AccessRuleTable';
import { useAccessRules } from './useAccessRules';
import type { AccessRule } from './access.types';

/** Access control: allow / deny rules for connections, MAIL and RCPT. */
export function AccessPage() {
  const { acl, loading, busy, error, add, remove } = useAccessRules();
  const handleRemove = (rule: AccessRule) => void remove(rule.scope, rule.action, rule.pattern);

  return (
    <Page className="gap-4">
      <PageHeader title="Access Control" description="Allow and deny rules for incoming SMTP" />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            {!loading && !acl.enabled && (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                The access plugin is disabled — enable it on the Plugins page to enforce these
                rules.
              </p>
            )}
            <AddAccessRuleForm onAdd={add} disabled={!acl.enabled} busy={busy} />
            <AccessRuleTable
              rules={acl.rules}
              onRemove={acl.enabled ? handleRemove : undefined}
              busy={busy}
            />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default AccessPage;
