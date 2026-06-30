// Typed fetch client for the admin API, grouped by domain.
import type {
  StatusResponse,
  PluginInfo,
  PluginConfigFile,
  CustomPlugin,
  CustomPluginDetail,
  PluginTemplate,
  TlsStatus,
  AuthUser,
  SpamSettings,
  DkimDomain,
  DkimDetail,
  DkimVerifyResult,
  SendMailInput,
  SendMailResult,
  Banner,
  LogEntry,
} from './types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    throw new Error((data.error as string) || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  status: () => request<StatusResponse>('/status'),

  plugins: {
    list: () => request<{ plugins: PluginInfo[] }>('/plugins'),
    set: (name: string, enabled: boolean) =>
      request<{ plugins: PluginInfo[] }>(`/plugins/${encodeURIComponent(name)}`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      }),
    getConfig: (name: string) =>
      request<{ config: PluginConfigFile }>(`/plugins/${encodeURIComponent(name)}/config`),
    saveConfig: (name: string, content: string) =>
      request<{ config: PluginConfigFile }>(`/plugins/${encodeURIComponent(name)}/config`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
  },

  customPlugins: {
    templates: () => request<{ templates: PluginTemplate[] }>('/custom-plugins/templates'),
    list: () => request<{ plugins: CustomPlugin[] }>('/custom-plugins'),
    get: (name: string) =>
      request<{ plugin: CustomPluginDetail }>(`/custom-plugins/${encodeURIComponent(name)}`),
    create: (name: string, template: string, enable: boolean) =>
      request<{ plugin: CustomPluginDetail }>('/custom-plugins', {
        method: 'POST',
        body: JSON.stringify({ name, template, enable }),
      }),
    save: (name: string, content: string) =>
      request<{ plugin: CustomPluginDetail }>(`/custom-plugins/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
    setEnabled: (name: string, enabled: boolean) =>
      request<{ plugin: CustomPluginDetail }>(
        `/custom-plugins/${encodeURIComponent(name)}/enabled`,
        { method: 'POST', body: JSON.stringify({ enabled }) },
      ),
    remove: (name: string) =>
      request<{ plugins: CustomPlugin[] }>(`/custom-plugins/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      }),
  },

  smtp: {
    get: () => request<{ values: Record<string, string> }>('/smtp'),
    set: (values: Record<string, string>) =>
      request<{ values: Record<string, string> }>('/smtp', {
        method: 'POST',
        body: JSON.stringify({ values }),
      }),
  },

  tls: {
    get: () => request<{ tls: TlsStatus }>('/tls'),
    saveCert: (cert: string, key: string) =>
      request<{ tls: TlsStatus }>('/tls/cert', {
        method: 'POST',
        body: JSON.stringify({ cert, key }),
      }),
    setEnabled: (enabled: boolean) =>
      request<{ tls: TlsStatus }>('/tls/enabled', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      }),
  },

  users: {
    list: () => request<{ users: AuthUser[] }>('/auth/users'),
    create: (email: string, password: string, aliases: string[] = []) =>
      request<{ users: AuthUser[] }>('/auth/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, aliases }),
      }),
    update: (currentEmail: string, email: string, password?: string, aliases: string[] = []) =>
      request<{ users: AuthUser[] }>(`/auth/users/${encodeURIComponent(currentEmail)}`, {
        method: 'PUT',
        body: JSON.stringify({ email, password, aliases }),
      }),
    remove: (email: string) =>
      request<{ users: AuthUser[] }>(`/auth/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      }),
  },

  domains: {
    list: () => request<{ domains: string[] }>('/domains'),
    add: (domain: string) =>
      request<{ domains: string[] }>('/domains', {
        method: 'POST',
        body: JSON.stringify({ domain }),
      }),
    remove: (domain: string) =>
      request<{ domains: string[] }>(`/domains/${encodeURIComponent(domain)}`, {
        method: 'DELETE',
      }),
  },

  spam: {
    get: () => request<{ settings: SpamSettings }>('/spam'),
    set: (settings: Partial<SpamSettings>) =>
      request<{ settings: SpamSettings }>('/spam', {
        method: 'POST',
        body: JSON.stringify(settings),
      }),
  },

  dkim: {
    list: () => request<{ domains: DkimDomain[] }>('/dkim'),
    get: (domain: string) => request<DkimDetail>(`/dkim/${encodeURIComponent(domain)}`),
    generate: (domain: string, selector?: string, keySize?: number) =>
      request<DkimDetail>('/dkim', {
        method: 'POST',
        body: JSON.stringify({ domain, selector, keySize }),
      }),
    verify: (domain: string) =>
      request<{ result: DkimVerifyResult }>(`/dkim/${encodeURIComponent(domain)}/verify`, {
        method: 'POST',
      }),
    remove: (domain: string) =>
      request<{ domains: DkimDomain[] }>(`/dkim/${encodeURIComponent(domain)}`, {
        method: 'DELETE',
      }),
  },

  mail: {
    send: (input: SendMailInput) =>
      request<{ result: SendMailResult }>('/mail/send', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  },

  banner: {
    get: () => request<{ banner: Banner }>('/banner'),
    set: (input: Partial<Banner>) =>
      request<{ banner: Banner }>('/banner', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  },

  logs: {
    list: (limit = 200) => request<{ entries: LogEntry[] }>(`/logs?limit=${limit}`),
  },
};
