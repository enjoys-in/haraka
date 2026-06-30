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
const NPM = (pkg: string) => `https://www.npmjs.com/package/${pkg}`;

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

  // ──────────────────────────────────────────────────────────────────────
  // Remaining plugins from the official Haraka registry
  //   https://haraka.github.io/plugins
  // The admin API marks each as core / installed / local / missing. "missing"
  // plugins must be installed (npm install haraka-plugin-<name>) before they
  // can be enabled, otherwise Haraka fails to start.
  // ──────────────────────────────────────────────────────────────────────

  // ── Core ──────────────────────────────────────────────────────────────
  { name: 'reseed_rng', label: 'Reseed RNG', category: 'Core',
    description: 'Periodically reseeds the random number generator for better entropy.',
    configFile: '', docsUrl: DOCS('reseed_rng') },
  { name: 'xclient', label: 'XCLIENT', category: 'Core',
    description: 'Lets trusted proxies pass the real client IP/identity via the XCLIENT command.',
    configFile: '', docsUrl: DOCS('xclient') },
  { name: 'redis', label: 'Redis', category: 'Core',
    description: 'Shared Redis connection used by karma, limit, known-senders, watch and more.',
    configFile: 'redis.ini', docsUrl: DOCS('redis') },
  { name: 'record_envelope_addresses', label: 'Record Envelope Addresses', category: 'Core',
    description: 'Adds headers recording the SMTP envelope sender and recipients.',
    configFile: '', docsUrl: DOCS('record_envelope_addresses') },

  // ── Connection ────────────────────────────────────────────────────────
  { name: 'tarpit', label: 'Tarpit', category: 'Connection',
    description: 'Slows down (delays responses to) abusive or suspicious connections.',
    configFile: 'tarpit.ini', docsUrl: DOCS('tarpit') },
  { name: 'delay_deny', label: 'Delay Deny', category: 'Connection',
    description: 'Holds back early deny results until RCPT/DATA so spammers reveal more.',
    configFile: '', docsUrl: DOCS('delay_deny') },
  { name: 'greylist', label: 'Greylist', category: 'Connection',
    description: 'Temporarily defers unknown senders; legitimate MTAs retry and pass (needs Redis).',
    configFile: 'greylist.ini', docsUrl: DOCS('greylist') },
  { name: 'known-senders', label: 'Known Senders', category: 'Connection',
    description: 'Rewards correspondents you have previously sent mail to (needs Redis).',
    configFile: 'known-senders.ini', docsUrl: DOCS('known-senders') },

  // ── TLS / Security ────────────────────────────────────────────────────
  { name: 'prevent_credential_leaks', label: 'Prevent Credential Leaks', category: 'TLS / Security',
    description: 'Blocks users from accidentally emailing their own login credentials.',
    configFile: '', docsUrl: DOCS('prevent_credential_leaks') },

  // ── Authentication ────────────────────────────────────────────────────
  { name: 'auth-enc-file', label: 'Auth: Encrypted File', category: 'Authentication',
    description: 'SMTP AUTH against users stored in an encrypted credentials file.',
    configFile: 'auth-enc-file.ini', docsUrl: DOCS('auth-enc-file') },
  { name: 'auth/auth_bridge', label: 'Auth: Bridge', category: 'Authentication',
    description: 'Bridges SMTP AUTH to a remote MTA.',
    configFile: '', docsUrl: DOCS('auth/auth_bridge') },
  { name: 'auth/auth_vpopmaild', label: 'Auth: vpopmaild', category: 'Authentication',
    description: 'Authenticates SMTP users against a vpopmaild service.',
    configFile: '', docsUrl: DOCS('auth/auth_vpopmaild') },
  { name: 'auth-imap', label: 'Auth: IMAP', category: 'Authentication',
    description: 'Authenticates SMTP users against an IMAP server.',
    configFile: '', docsUrl: NPM('haraka-plugin-auth-imap') },
  { name: 'dovecot', label: 'Dovecot', category: 'Authentication',
    description: 'SMTP AUTH and recipient validation against a Dovecot server.',
    configFile: 'dovecot.ini', docsUrl: DOCS('dovecot') },
  { name: 'ldap', label: 'LDAP', category: 'Authentication',
    description: 'Aliases, authentication and recipient validation from an LDAP directory.',
    configFile: 'ldap.ini', docsUrl: DOCS('ldap') },
  { name: 'mailauth', label: 'mailauth (SPF/DKIM/DMARC/ARC)', category: 'Authentication',
    description: 'Unified email authentication: SPF, DKIM, DMARC, ARC and BIMI checks.',
    configFile: 'mailauth.ini', docsUrl: DOCS('mailauth') },
  { name: 'opendkim', label: 'OpenDKIM', category: 'Authentication',
    description: 'Signs and verifies DKIM signatures using OpenDKIM.',
    configFile: '', docsUrl: NPM('haraka-plugin-opendkim') },

  // ── RCPT TO ───────────────────────────────────────────────────────────
  { name: 'aliases', label: 'Aliases', category: 'RCPT TO',
    description: 'Expands email aliases to one or more real recipient addresses.',
    configFile: '', docsUrl: DOCS('aliases') },
  { name: 'recipient-routes', label: 'Recipient Routes', category: 'RCPT TO',
    description: 'Validates recipients and routes them to specific next-hop destinations.',
    configFile: 'recipient-routes.ini', docsUrl: DOCS('recipient-routes') },
  { name: 'rcpt-postgresql', label: 'RCPT via PostgreSQL', category: 'RCPT TO',
    description: 'Validates recipient addresses against a PostgreSQL database.',
    configFile: '', docsUrl: NPM('haraka-plugin-rcpt-postgresql') },

  // ── Anti-Spam ─────────────────────────────────────────────────────────
  { name: 'dcc', label: 'DCC', category: 'Anti-Spam',
    description: 'Distributed Checksum Clearinghouse: detects bulk/spam mail by body checksum.',
    configFile: 'dcc.ini', docsUrl: DOCS('dcc') },
  { name: 'messagesniffer', label: 'MessageSniffer', category: 'Anti-Spam',
    description: 'Anti-spam scanning via the commercial MessageSniffer engine.',
    configFile: '', docsUrl: DOCS('messagesniffer') },
  { name: 'block_me', label: 'Block Me', category: 'Anti-Spam',
    description: 'Lets users grow a personal block list by forwarding unwanted mail.',
    configFile: '', docsUrl: DOCS('block_me') },

  // ── Anti-Virus ────────────────────────────────────────────────────────
  { name: 'avg', label: 'AVG Antivirus', category: 'Anti-Virus',
    description: 'Scans messages for viruses using the AVG antivirus scanner.',
    configFile: '', docsUrl: DOCS('avg') },
  { name: 'esets', label: 'ESET Mail Security', category: 'Anti-Virus',
    description: 'Virus scanning via ESET Mail Security (esets).',
    configFile: '', docsUrl: DOCS('esets') },
  { name: 'milter', label: 'Milter', category: 'Anti-Virus',
    description: 'Connects Haraka to milter filters (e.g. ClamAV, SpamAssassin, custom).',
    configFile: '', docsUrl: DOCS('milter') },

  // ── Queue / Delivery ──────────────────────────────────────────────────
  { name: 'queue/smtp_bridge', label: 'Queue: SMTP Bridge', category: 'Queue / Delivery',
    description: 'Bridges the SMTP session through to another MTA.',
    configFile: '', docsUrl: DOCS('queue/smtp_bridge') },
  { name: 'queue/lmtp', label: 'Queue: LMTP', category: 'Queue / Delivery',
    description: 'Delivers queued messages to a local store via LMTP.',
    configFile: '', docsUrl: DOCS('queue/lmtp') },
  { name: 'queue/qmail-queue', label: 'Queue: qmail-queue', category: 'Queue / Delivery',
    description: 'Hands accepted mail to a qmail queue process.',
    configFile: '', docsUrl: DOCS('queue/qmail-queue') },
  { name: 'wildduck', label: 'WildDuck', category: 'Queue / Delivery',
    description: 'Queues messages to (and validates recipients against) a WildDuck mail store.',
    configFile: '', docsUrl: DOCS('wildduck') },
  { name: 'kafka', label: 'Kafka', category: 'Queue / Delivery',
    description: 'Queues inbound mail onto an Apache Kafka topic.',
    configFile: '', docsUrl: NPM('haraka-plugin-kafka') },
  { name: 'rabbitmq', label: 'RabbitMQ', category: 'Queue / Delivery',
    description: 'Queues messages to RabbitMQ.',
    configFile: '', docsUrl: NPM('haraka-plugin-rabbitmq') },
  { name: 'rabbitmq_amqplib', label: 'RabbitMQ (amqplib)', category: 'Queue / Delivery',
    description: 'Queues messages to RabbitMQ using the amqplib client.',
    configFile: '', docsUrl: NPM('haraka-plugin-rabbitmq_amqplib') },
  { name: 'mongodb', label: 'MongoDB', category: 'Queue / Delivery',
    description: 'Queues messages to a MongoDB collection.',
    configFile: '', docsUrl: NPM('haraka-plugin-mongodb') },
  { name: 'rails', label: 'Rails Action Mailbox', category: 'Queue / Delivery',
    description: 'Delivers messages to a Rails app via Action Mailbox.',
    configFile: '', docsUrl: NPM('haraka-plugin-rails') },
  { name: 'save-sent', label: 'Save Sent', category: 'Queue / Delivery',
    description: 'Saves a copy of sent mail to the senders mailbox on the server.',
    configFile: '', docsUrl: DOCS('save-sent') },

  // ── Outbound ──────────────────────────────────────────────────────────
  { name: 'outbound-logger', label: 'Outbound Logger', category: 'Outbound',
    description: 'JSON logging of outbound traffic with delivery and bounce metadata.',
    configFile: '', docsUrl: DOCS('outbound-logger') },
  { name: 'accounting_files', label: 'Accounting Files', category: 'Outbound',
    description: 'Stores and archives custom accounting information about outbound traffic.',
    configFile: '', docsUrl: NPM('haraka-plugin-accounting_files') },
  { name: 'srs', label: 'SRS', category: 'Outbound',
    description: 'Sender Rewriting Scheme so forwarded mail survives SPF checks.',
    configFile: 'srs.ini', docsUrl: DOCS('srs') },
  { name: 'batv-srs', label: 'BATV + SRS', category: 'Outbound',
    description: 'Bounce Address Tag Validation combined with Sender Rewriting Scheme.',
    configFile: '', docsUrl: DOCS('batv-srs') },
  { name: 'vmta', label: 'Virtual MTA', category: 'Outbound',
    description: 'Virtual MTA management for sending across multiple IPs or identities.',
    configFile: '', docsUrl: NPM('haraka-plugin-vmta') },

  // ── Monitoring ────────────────────────────────────────────────────────
  { name: 'elasticsearch', label: 'Elasticsearch', category: 'Monitoring',
    description: 'Stores per-message and per-connection metadata in Elasticsearch.',
    configFile: 'elasticsearch.ini', docsUrl: DOCS('elasticsearch') },
];

const BY_NAME = new Map(PLUGIN_CATALOG.map((p) => [p.name, p]));

export function getCatalogEntry(name: string): PluginInfo | undefined {
  return BY_NAME.get(name);
}
