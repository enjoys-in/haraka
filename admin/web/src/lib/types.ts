// Shared types mirroring the admin API responses.
export interface ServiceStatus {
  key: string;
  label: string;
  host: string;
  port: number;
  up: boolean;
}

export interface StatusResponse {
  configDir: string;
  services: ServiceStatus[];
}

export interface PluginEntry {
  name: string;
  enabled: boolean;
}

export type PluginRole = 'inbound' | 'outbound' | 'both';

export interface PluginInfo extends PluginEntry {
  label: string;
  category: string;
  description: string;
  configFile: string;
  docsUrl: string;
  configExists: boolean;
  source: 'core' | 'installed' | 'local' | 'missing';
  available: boolean;
  npmPackage?: string;
  role: PluginRole;
}

export interface PluginConfigFile {
  name: string;
  configFile: string;
  content: string;
  exists: boolean;
}

export interface CustomPlugin {
  name: string;
  enabled: boolean;
  size: number;
  modified: number;
}

export interface CustomPluginDetail extends CustomPlugin {
  content: string;
}

export interface PluginTemplate {
  id: string;
  label: string;
  hook: string;
  description: string;
  code: string;
}

/** SMTP phase a rule applies to (matches the access plugin's PRECISE lists). */
export type AccessScope = 'connect' | 'mail' | 'rcpt';
export type AccessAction = 'allow' | 'deny';

export interface AccessRule {
  id: string;
  scope: AccessScope;
  action: AccessAction;
  pattern: string;
}

export interface AccessAcl {
  /** Whether the access plugin is currently enabled in config/plugins. */
  enabled: boolean;
  rules: AccessRule[];
}

export interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  altNames: string[];
  fingerprint: string;
  serialNumber: string;
  selfSigned: boolean;
  expired: boolean;
}

export interface TlsStatus {
  enabled: boolean;
  certFile: string;
  keyFile: string;
  certExists: boolean;
  keyExists: boolean;
  info: CertInfo | null;
}

export interface AuthUser {
  email: string;
  aliases: string[];
}

export interface SpamSettings {
  spamassassin: { spamd_socket: string; max_size: string; reject_threshold: string };
  rspamd: { host: string; port: string; add_headers: string };
  clamd: { clamd_socket: string };
}

export interface DkimDomain {
  domain: string;
  selector: string;
  hasPrivateKey: boolean;
  dnsName: string;
  dnsValue: string;
}

export interface DkimDetail {
  dkim: DkimDomain;
  publicKey: string;
  instructions: string;
}

export interface DkimVerifyResult {
  domain: string;
  host: string;
  found: boolean;
  match: boolean;
  published: string;
  expected: string;
  message: string;
}

export interface SendMailInput {
  from?: string;
  to: string;
  subject?: string;
  text?: string;
  html?: string;
}

export interface SendMailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
}

export type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  plugin: string | null;
  connectionId: string | null;
  message: string;
}

// SMTP 220 greeting banner + white-labeling toggles.
export interface Banner {
  hostname: string;
  greeting: string;
  bannerChars: number;
  showVersion: boolean;
  preview: string;
}

// Live inbound event pushed over /ws/inbound (from the inbound_notify plugin).
export interface InboundEvent {
  event_type: 'inbound' | 'outbound' | 'bounce';
  uuid: string;
  ts: number;
  from: string;
  to: string[];
  subject: string;
  bytes: number;
  remote_ip: string;
  helo: string;
  spam_score: number | null;
  raw: string;
  bounce_error?: string;
}

// Aliases / forwarding (config/aliases). action mirrors the file's semantics.
export type AliasAction = 'alias' | 'drop' | 'continue';

export interface MailAlias {
  id: string;
  address: string;
  destinations: string[];
  action: AliasAction;
}

// Outbound forward routes (config/smtp_forward.ini). "*" is the default route.
export interface TransportRoute {
  id: string;
  domain: string;
  host: string;
  port: number;
  tls: boolean;
  auth: boolean;
  isDefault: boolean;
}

// Outbound spool queue (HARAKA_ROOT/queue qfiles).
export type QueueState = 'queued' | 'sending' | 'deferred' | 'frozen' | 'bounced';

export interface QueuedMessage {
  id: string;
  from: string;
  to: string[];
  subject: string;
  size: number;
  state: QueueState;
  attempts: number;
  nextRetryAt: number | null;
  lastError: string | null;
  queuedAt: number;
}

export interface QueueSummary {
  total: number;
  deferred: number;
  sending: number;
  frozen: number;
  oldestAgeSeconds: number;
}

export interface QueueView {
  summary: QueueSummary;
  messages: QueuedMessage[];
}

// Delivery history derived from Haraka's outbound delivery logs.
export type MailDirection = 'inbound' | 'outbound';
export type DeliveryStatus =
  | 'delivered'
  | 'received'
  | 'deferred'
  | 'bounced'
  | 'rejected'
  | 'quarantined';

export interface MailRecord {
  id: string;
  direction: MailDirection;
  from: string;
  to: string;
  subject: string;
  status: DeliveryStatus;
  size: number;
  spamScore: number | null;
  remoteHost: string;
  timestamp: number;
}

// Editable server settings sourced from config/me, connection.ini, smtp.ini.
export interface ServerSettings {
  hostname: string;
  helo: string;
  maxMessageSizeMb: number;
  inactivityTimeoutSec: number;
}

// Quarantine spool (HARAKA_ROOT/queue/quarantine).
export type QuarantineReason = 'spam' | 'virus' | 'policy' | 'dmarc';

export interface QuarantinedMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  reason: QuarantineReason;
  score: number | null;
  size: number;
  quarantinedAt: number;
}

// Live monitoring snapshot composed from status + queue + delivery history.
export interface ServiceStatus {
  key: string;
  label: string;
  host: string;
  port: number;
  up: boolean;
}

export interface MonitoringSnapshot {
  services: ServiceStatus[];
  queue: {
    total: number;
    deferred: number;
    oldestAgeSeconds: number;
  };
  delivery: {
    total: number;
    delivered: number;
    deferred: number;
    bounced: number;
  };
  uptimeSeconds: number;
  timestamp: number;
}
