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
