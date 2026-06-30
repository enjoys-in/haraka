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

export interface PluginInfo extends PluginEntry {
  label: string;
  category: string;
  description: string;
  configFile: string;
  docsUrl: string;
  configExists: boolean;
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

// Live inbound event pushed over /ws/inbound (from the inbound_notify plugin).
export interface InboundEvent {
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
}
