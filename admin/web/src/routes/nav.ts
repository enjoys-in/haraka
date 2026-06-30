import {
  LayoutDashboard,
  ScrollText,
  Globe,
  Users,
  Server,
  Megaphone,
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  Code2,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PATHS } from './paths';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Sidebar structure. Inbound and outbound plugins are split into their own
// group so each shows only the plugins relevant to that mail flow.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: PATHS.dashboard, label: 'Dashboard', icon: LayoutDashboard },
      { to: PATHS.logs, label: 'Logs', icon: ScrollText },
    ],
  },
  {
    label: 'Mail',
    items: [
      { to: PATHS.mail, label: 'Mail', icon: Mail },
      { to: PATHS.domains, label: 'Domains', icon: Globe },
      { to: PATHS.users, label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: PATHS.smtp, label: 'SMTP', icon: Server },
      { to: PATHS.banner, label: 'Banner', icon: Megaphone },
      { to: PATHS.dkim, label: 'DKIM', icon: KeyRound },
    ],
  },
  {
    label: 'Plugins',
    items: [
      { to: PATHS.inboundPlugins, label: 'Inbound Plugins', icon: ArrowDownToLine },
      { to: PATHS.outboundPlugins, label: 'Outbound Plugins', icon: ArrowUpFromLine },
      { to: PATHS.customPlugins, label: 'Custom Plugins', icon: Code2 },
    ],
  },
  {
    label: 'Security',
    items: [
      { to: PATHS.tls, label: 'TLS / SSL', icon: Lock },
      { to: PATHS.spam, label: 'Spam & AV', icon: ShieldCheck },
    ],
  },
];
