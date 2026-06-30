// Central registry of client-side route paths. Imported by both the router and
// the navigation config so the two can never drift apart.
export const PATHS = {
  dashboard: '/dashboard',
  logs: '/logs',
  mail: '/mail',
  domains: '/domains',
  users: '/users',
  smtp: '/smtp',
  banner: '/banner',
  dkim: '/dkim',
  inboundPlugins: '/plugins/inbound',
  outboundPlugins: '/plugins/outbound',
  customPlugins: '/custom-plugins',
  tls: '/tls',
  spam: '/spam',
} as const;
