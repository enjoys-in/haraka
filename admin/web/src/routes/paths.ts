// Central registry of client-side route paths. Imported by both the router and
// the navigation config so the two can never drift apart.
export const PATHS = {
  dashboard: '/dashboard',
  logs: '/logs',
  monitoring: '/monitoring',
  mail: '/mail',
  mailHistory: '/mail-history',
  domains: '/domains',
  users: '/users',
  aliases: '/aliases',
  queue: '/queue',
  smtp: '/smtp',
  banner: '/banner',
  dkim: '/dkim',
  routing: '/routing',
  settings: '/settings',
  inboundPlugins: '/plugins/inbound',
  outboundPlugins: '/plugins/outbound',
  customPlugins: '/custom-plugins',
  tls: '/tls',
  spam: '/spam',
  quarantine: '/quarantine',
} as const;
