// Custom plugins domain: let admins create, edit, enable and delete their own
// Haraka plugins (plain .js files in PLUGINS_DIR) plus register them in
// config/plugins. Plugin code runs inside Haraka with full Node.js access, so
// the API is admin-only by design; we still constrain the *filename* tightly so
// it can never escape PLUGINS_DIR or clobber a managed system plugin.
import fs from 'node:fs';
import path from 'node:path';
import { PLUGINS_DIR } from '../../config';
import { readRaw, writeRaw } from '../../core/files';
import { CUSTOM_PLUGIN_TEMPLATES } from './templates';

// Simple, single-segment names only: no slashes, no '..', no leading dot. This
// keeps every plugin a single file directly inside PLUGINS_DIR.
const SAFE_NAME = /^[a-z0-9][a-z0-9._-]*$/;

// Plugins shipped/managed by the admin app itself — hidden from the custom list
// and protected from create/overwrite/delete so the UI can't break them.
const RESERVED = new Set(['inbound_notify']);

export interface CustomPlugin {
  name: string;
  enabled: boolean;
  size: number;
  modified: number;
}

export interface CustomPluginDetail extends CustomPlugin {
  content: string;
}

function pluginFile(name: string): string {
  if (!SAFE_NAME.test(name) || name.includes('..')) {
    throw new Error('Invalid plugin name (use letters, digits, . _ - only)');
  }
  // Resolve both sides so the guard is robust to separator/normalization quirks
  // (e.g. a HARAKA_PLUGINS_DIR override using non-native slashes). SAFE_NAME
  // already forbids separators and '..', so the file must sit directly inside.
  const root = path.resolve(PLUGINS_DIR);
  const file = path.resolve(root, `${name}.js`);
  if (path.dirname(file) !== root) {
    throw new Error('Invalid plugin path');
  }
  return file;
}

// First token of a config/plugins line, ignoring an optional leading '#'.
function firstToken(line: string): { token: string; commented: boolean } | null {
  const commented = /^\s*#/.test(line);
  const rest = line.replace(/^\s*#?\s*/, '').trim();
  if (!rest) return null;
  return { token: rest.split(/\s+/)[0], commented };
}

/** Map of plugin name -> enabled (uncommented) from config/plugins. */
function enabledState(): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const line of readRaw('plugins').split(/\r?\n/)) {
    const parsed = firstToken(line);
    if (!parsed) continue;
    if (!map.has(parsed.token)) map.set(parsed.token, !parsed.commented);
  }
  return map;
}

function toDetail(name: string): CustomPluginDetail {
  const file = pluginFile(name);
  if (!fs.existsSync(file)) throw new Error('Plugin not found');
  const stat = fs.statSync(file);
  return {
    name,
    enabled: enabledState().get(name) ?? false,
    size: stat.size,
    modified: Math.round(stat.mtimeMs),
    content: fs.readFileSync(file, 'utf8'),
  };
}

export function listTemplates() {
  return CUSTOM_PLUGIN_TEMPLATES;
}

export function listCustomPlugins(): CustomPlugin[] {
  if (!fs.existsSync(PLUGINS_DIR)) return [];
  const state = enabledState();
  return fs
    .readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.js'))
    .map((e) => e.name.slice(0, -3))
    .filter((name) => SAFE_NAME.test(name) && !RESERVED.has(name))
    .map((name) => {
      const stat = fs.statSync(path.join(PLUGINS_DIR, `${name}.js`));
      return {
        name,
        enabled: state.get(name) ?? false,
        size: stat.size,
        modified: Math.round(stat.mtimeMs),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function readCustomPlugin(name: string): CustomPluginDetail {
  if (RESERVED.has(name)) throw new Error('That plugin is managed by the system');
  return toDetail(name);
}

export function createCustomPlugin(
  name: string,
  templateId: string,
  enable: boolean,
): CustomPluginDetail {
  const file = pluginFile(name);
  if (RESERVED.has(name)) throw new Error(`'${name}' is reserved`);
  if (fs.existsSync(file)) throw new Error('A plugin with this name already exists');

  const tpl = CUSTOM_PLUGIN_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) throw new Error('Unknown template');

  fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  fs.writeFileSync(file, tpl.code.replace(/__PLUGIN_NAME__/g, name));
  if (enable) setCustomPluginEnabled(name, true);
  return toDetail(name);
}

export function writeCustomPlugin(name: string, content: string): CustomPluginDetail {
  if (RESERVED.has(name)) throw new Error('That plugin is managed by the system');
  const file = pluginFile(name);
  if (!fs.existsSync(file)) throw new Error('Plugin not found');
  if (typeof content !== 'string') throw new Error('Invalid content');
  fs.writeFileSync(file, content);
  return toDetail(name);
}

export function setCustomPluginEnabled(name: string, enabled: boolean): CustomPluginDetail {
  if (RESERVED.has(name)) throw new Error('That plugin is managed by the system');
  if (!fs.existsSync(pluginFile(name))) throw new Error('Plugin not found');

  const lines = readRaw('plugins').split(/\r?\n/);
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const parsed = firstToken(lines[i]);
    if (!parsed || parsed.token !== name) continue;
    found = true;
    const rest = lines[i].replace(/^\s*#?\s*/, '');
    lines[i] = enabled ? rest : `#${rest}`;
    break;
  }
  // Not yet listed: append it so Haraka loads it (order can be tuned in Plugins).
  if (!found && enabled) lines.push(name);
  writeRaw('plugins', lines.join('\n'));
  return toDetail(name);
}

export function removeCustomPlugin(name: string): CustomPlugin[] {
  if (RESERVED.has(name)) throw new Error('That plugin is managed by the system');
  const file = pluginFile(name);
  if (fs.existsSync(file)) fs.rmSync(file);

  // Drop any line in config/plugins that references this plugin.
  const lines = readRaw('plugins')
    .split(/\r?\n/)
    .filter((line) => {
      const parsed = firstToken(line);
      return !parsed || parsed.token !== name;
    });
  writeRaw('plugins', lines.join('\n'));
  return listCustomPlugins();
}
