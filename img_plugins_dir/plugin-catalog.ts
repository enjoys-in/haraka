// Catalog of Haraka plugins shown in the admin UI. Each entry carries human
// friendly metadata, the config file the plugin reads (so the UI can offer a
// safe per-plugin config editor), and a link to the official documentation.
//
// `configFile` is intentionally derived from this trusted catalog (never from
// client input) so the config editor cannot be used to read/write arbitrary
// files. Plugins without a config file are config-less (toggle + docs only).

export interface PluginInfo {
  /** Plugin token as written in config/plugins (e.g. "auth/flat_file"). */
  name: string;
  /** Human friendly title. */
  label: string;
  /** SMTP stage / grouping used to organise the UI. */
  category: string;
  /** Short info text so users understand what the plugin does. */
  description: string;
  /** Config file the plugin reads, relative to config/. Empty = no config. */
  configFile: string;
  /** Official documentation page. */
  docsUrl: string;
}

const DOCS = (name: string) => `https://haraka.github.io/plugins/${name}`;

export const PLUGIN_CATALOG: PluginInfo[] = [
  // ── Core ──────────────────────────────────────────────────────────────
  { name: 'status', label: 'Status', category: 'Core',
    description: 'Exposes a status command for monitoring connections and workers.',
    configFile: '', docsUrl: DOCS('status') },
  { name: 'process_title', label: 'Process Title', category: 'Core',
    description: 'Shows live connection/message counts in the OS process title (top/ps).',
    configFile: '', docsUrl: DOCS('process_title') },
  { name: 'syslog', label: 'Syslog', category: 'Core',
    description: 'Sends Haraka log output to the system syslog daemon.',
    configFile: 'syslog.ini', docsUrl: DOCS('syslog') },

  // ── Connection ────────────────────────────────────────────────────────
  { name: 'toobusy', label: 'Too Busy', category: 'Connection',
    description: 'Rejects new connections when the server event loop is overloaded.',
    configFile: 'toobusy.ini', docsUrl: DOCS('toobusy') },
  { name: 'karma', label: 'Karma', category: 'Connection',
    description: 'Reputation scoring of senders (requires Redis). Rewards good, penalises bad.',
    configFile: 'karma.ini', docsUrl: DOCS('karma') },
  { name: 'limit', label: 'Limit', category: 'Connection',
    description: 'Rate, concurrency and error limits per host/sender (requires Redis).',
    configFile: 'limit.ini', docsUrl: DOCS('limit') },
  { name: 'relay', label: 'Relay', category: 'Connection',
    description: 'Controls which hosts/networks are allowed to relay mail through Haraka.',
    configFile: 'relay.ini', docsUrl: DOCS('relay') },
  { name: 'access', label: 'Access Lists', category: 'Connection',
    description: 'Allow/deny by IP, rDNS host, HELO name, MAIL FROM or RCPT TO.',
    configFile: 'access.ini', docsUrl: DOCS('access') },
  { name: 'p0f', label: 'p0f', category: 'Connection',
    description: 'Passive OS fingerprinting of connecting clients via a p0f socket.',
    configFile: 'p0f.ini', docsUrl: DOCS('p0f') },
  { name: 'geoip', label: 'GeoIP', category: 'Connection',
    description: 'Adds geographic/country information about the connecting IP.',
    configFile: 'geoip.ini', docsUrl: DOCS('geoip') },
  { name: 'asn', label: 'ASN', category: 'Connection',
    description: 'Looks up the Autonomous System Number (network owner) of the client IP.',
    configFile: 'asn.ini', docsUrl: DOCS('asn') },
  { name: 'fcrdns', label: 'FCrDNS', category: 'Connection',
    description: 'Forward-confirmed reverse DNS check of the connecting host.',
    configFile: 'fcrdns.ini', docsUrl: DOCS('fcrdns') },
  { name: 'dns-list', label: 'DNS Lists (DNSBL)', category: 'Connection',
    description: 'Checks the client IP against DNS block/allow lists (Spamhaus, etc.).',
    configFile: 'dns-list.ini', docsUrl: DOCS('dns-list') },

  // ── HELO ──────────────────────────────────────────────────────────────
  { name: 'early_talker', label: 'Early Talker', category: 'HELO',
    description: 'Penalises clients that send data before the greeting is finished.',
    configFile: 'early_talker.ini', docsUrl: DOCS('early_talker') },
  { name: 'helo.checks', label: 'HELO Checks', category: 'HELO',
    description: 'Validates the HELO/EHLO hostname (format, resolvable, not bare IP…).',
    configFile: 'helo.checks.ini', docsUrl: DOCS('helo.checks') },

  // ── TLS / Security ────────────────────────────────────────────────────
  { name: 'tls', label: 'TLS / STARTTLS', category: 'TLS / Security',
    description: 'Enables STARTTLS encryption. Configure certificates, ciphers and versions.',
    configFile: 'tls.ini', docsUrl: DOCS('tls') },

  // ── Authentication ────────────────────────────────────────────────────
  { name: 'auth/flat_file', label: 'Auth: Flat File', category: 'Authentication',
    description: 'SMTP AUTH against a flat file of users (config/auth_flat_file.ini).',
    configFile: 'auth_flat_file.ini', docsUrl: DOCS('auth/flat_file') },
  { name: 'auth/auth_proxy', label: 'Auth: Proxy', category: 'Authentication',
    description: 'Proxies SMTP AUTH to one or more upstream SMTP servers.',
    configFile: 'auth_proxy.ini', docsUrl: DOCS('auth/auth_proxy') },
  { name: 'auth/auth_ldap', label: 'Auth: LDAP', category: 'Authentication',
    description: 'Authenticates SMTP users against an LDAP directory.',
    configFile: 'auth_ldap.ini', docsUrl: DOCS('auth/auth_ldap') },

  // ── MAIL FROM ─────────────────────────────────────────────────────────
  { name: 'mail_from.is_resolvable', label: 'MAIL FROM Resolvable', category: 'MAIL FROM',
    description: 'Requires the MAIL FROM domain to resolve to a valid MX/A record.',
    configFile: 'mail_from.is_resolvable.ini', docsUrl: DOCS('mail_from.is_resolvable') },
  { name: 'spf', label: 'SPF', category: 'MAIL FROM',
    description: 'Sender Policy Framework: verifies the sending IP is authorised for the domain.',
    configFile: 'spf.ini', docsUrl: DOCS('spf') },

  // ── RCPT TO ───────────────────────────────────────────────────────────
  { name: 'rcpt_to.in_host_list', label: 'RCPT in Host List', category: 'RCPT TO',
    description: 'Accepts mail only for domains listed in config/host_list. Required for inbound.',
    configFile: 'host_list', docsUrl: DOCS('rcpt_to.in_host_list') },
  { name: 'qmail-deliverable', label: 'Qmail Deliverable', category: 'RCPT TO',
    description: 'Validates recipients against a qmail-deliverable service.',
    configFile: 'qmail-deliverable.ini', docsUrl: DOCS('qmail-deliverable') },
  { name: 'rcpt_to.ldap', label: 'RCPT via LDAP', category: 'RCPT TO',
    description: 'Validates recipient addresses against an LDAP directory.',
    configFile: 'rcpt_to.ldap.ini', docsUrl: DOCS('rcpt_to.ldap') },
  { name: 'rcpt_to.routes', label: 'RCPT Routes', category: 'RCPT TO',
    description: 'Validates recipients and routes them to specific next-hop destinations.',
    configFile: 'rcpt_to.routes.ini', docsUrl: DOCS('rcpt_to.routes') },

  // ── Data / Headers ────────────────────────────────────────────────────
  { name: 'bounce', label: 'Bounce', category: 'Data / Headers',
    description: 'Rejects forged or malformed bounce (null-sender) messages.',
    configFile: 'bounce.ini', docsUrl: DOCS('bounce') },
  { name: 'headers', label: 'Headers', category: 'Data / Headers',
    description: 'Checks messages for valid, sane and non-duplicated headers.',
    configFile: 'headers.ini', docsUrl: DOCS('headers') },
  { name: 'data.signatures', label: 'Data Signatures', category: 'Data / Headers',
    description: 'Rejects messages whose body matches known bad content signatures.',
    configFile: 'data.signatures.ini', docsUrl: DOCS('data.signatures') },
  { name: 'attachment', label: 'Attachment', category: 'Data / Headers',
    description: 'Inspects and can block attachments by filename, type or archive contents.',
    configFile: 'attachment.ini', docsUrl: DOCS('attachment') },
  { name: 'dkim', label: 'DKIM Sign & Verify', category: 'Data / Headers',
    description: 'Signs outbound mail and verifies inbound DKIM signatures (config/dkim_sign.ini).',
    configFile: 'dkim_sign.ini', docsUrl: DOCS('dkim') },

  // ── Anti-Spam ─────────────────────────────────────────────────────────
  { name: 'uribl', label: 'URIBL', category: 'Anti-Spam',
    description: 'Checks URIs found in the message body against URI block lists.',
    configFile: 'uribl.ini', docsUrl: DOCS('uribl') },
  { name: 'spamassassin', label: 'SpamAssassin', category: 'Anti-Spam',
    description: 'Scores messages with SpamAssassin (spamd) and can reject high scores.',
    configFile: 'spamassassin.ini', docsUrl: DOCS('spamassassin') },
  { name: 'rspamd', label: 'Rspamd', category: 'Anti-Spam',
    description: 'Filters messages through an Rspamd daemon (scoring, headers, rejection).',
    configFile: 'rspamd.ini', docsUrl: DOCS('rspamd') },

  // ── Anti-Virus ────────────────────────────────────────────────────────
  { name: 'clamd', label: 'ClamAV (clamd)', category: 'Anti-Virus',
    description: 'Scans messages for viruses using a ClamAV clamd daemon.',
    configFile: 'clamd.ini', docsUrl: DOCS('clamd') },

  // ── Queue / Delivery ──────────────────────────────────────────────────
  { name: 'queue/smtp_forward', label: 'Queue: SMTP Forward', category: 'Queue / Delivery',
    description: 'Forwards accepted mail to a fixed smart host over SMTP.',
    configFile: 'smtp_forward.ini', docsUrl: DOCS('queue/smtp_forward') },
  { name: 'queue/smtp_proxy', label: 'Queue: SMTP Proxy', category: 'Queue / Delivery',
    description: 'Proxies the SMTP session to a backend server during DATA.',
    configFile: 'smtp_proxy.ini', docsUrl: DOCS('queue/smtp_proxy') },
  { name: 'queue/discard', label: 'Queue: Discard', category: 'Queue / Delivery',
    description: 'Silently accepts then discards mail (useful for testing/sinks).',
    configFile: '', docsUrl: DOCS('queue/discard') },
  { name: 'queue/quarantine', label: 'Queue: Quarantine', category: 'Queue / Delivery',
    description: 'Writes a copy of messages to a quarantine directory on disk.',
    configFile: '', docsUrl: DOCS('queue/quarantine') },

  // ── Monitoring ────────────────────────────────────────────────────────
  { name: 'watch', label: 'Watch', category: 'Monitoring',
    description: 'Live web UI to watch connections in real time (requires Redis).',
    configFile: '', docsUrl: DOCS('watch') },
];

const BY_NAME = new Map(PLUGIN_CATALOG.map((p) => [p.name, p]));

export function getCatalogEntry(name: string): PluginInfo | undefined {
  return BY_NAME.get(name);
}
