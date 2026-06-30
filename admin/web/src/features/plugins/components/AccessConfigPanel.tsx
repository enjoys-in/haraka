import { Info } from 'lucide-react';
import { AddAccessRuleForm } from '@/features/access/components/AddAccessRuleForm';
import { AccessRuleTable } from '@/features/access/components/AccessRuleTable';
import { MOCK_ACCESS_RULES } from '@/features/access/access.mock';

/**
 * Inline ACL manager shown when configuring the `access` plugin — lets the user
 * control allow/deny rules by IP, rDNS host, HELO, MAIL FROM or RCPT TO instead
 * of editing the raw access.ini text. Rule data is still placeholder until the
 * access list-file endpoints are wired.
 */
export function AccessConfigPanel() {
  return (
    <div className="space-y-3 border-t border-border/40 px-3 py-3">
      <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFA724]" />
        <p>
          Allow or deny senders by IP, rDNS host, HELO name, MAIL FROM or RCPT TO. Rules are
          enforced by the access plugin while it is enabled.
        </p>
      </div>
      <AddAccessRuleForm />
      <AccessRuleTable rules={MOCK_ACCESS_RULES} />
    </div>
  );
}
