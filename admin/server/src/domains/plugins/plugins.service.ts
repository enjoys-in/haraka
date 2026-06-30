// Plugins domain: toggle entries in config/plugins (line-oriented list) and
// read/write each plugin's own config file via the trusted catalog.
import fs from 'node:fs';
import path from 'node:path';
import { readRaw, writeRaw, configPath } from '../../core/files';
import { HARAKA_ROOT, PLUGINS_DIR } from '../../config';
import { PLUGIN_CATALOG, getCatalogEntry, type PluginInfo } from './plugin-catalog';

export interface PluginEntry {
  name: string;
  enabled: boolean;
}

/** Where a plugin's code comes from (and whether it can be enabled at all). */
export type PluginSource = 'core' | 'installed' | 'local' | 'missing';

/** Catalog metadata + runtime state for the UI. */
export interface PluginListItem extends PluginInfo {
  enabled: boolean;
  configExists: boolean;
  source: PluginSource;
  /** False only when the plugin code is absent (enabling it would break boot). */
  available: boolean;
  /** npm package providing the plugin, for an install hint when it is missing. */
  npmPackage?: string;
}

export interface PluginConfigFile {
  name: string;
  configFile: string;
  content: string;
  exists: boolean;
}

// Plugin tokens are safe, slash/dot/dash separated identifiers — no spaces or
// newlines — so they can never inject extra lines into config/plugins.
const SAFE_NAME = /^[a-zA-Z0-9._/-]+$/;
const CATALOG_NAMES = new Set(PLUGIN_CATALOG.map((p) => p.name));

// Where plugin code can live, in resolution order.
const CORE_PLUGINS_DIR = path.join(HARAKA_ROOT, 'node_modules', 'Haraka', 'plugins');
const NODE_MODULES = path.join(HARAKA_ROOT, 'node_modules');

/** Conventional npm package for a plugin. Path-style core names (e.g.
 *  "queue/smtp_forward") are never npm packages, so return undefined. */
function npmPackageFor(name: string): string | undefined {
  return name.includes('/') ? undefined : `haraka-plugin-${name}`;
}

/** Work out whether a plugin's code is present so the UI can show if it is
 *  ready to enable. Order: local custom plugin -> Haraka core -> npm package. */
export function resolveSource(name: string): { source: PluginSource; npmPackage?: string } {
  if (fs.existsSync(path.join(PLUGINS_DIR, `${name}.js`))) return { source: 'local' };
  if (fs.existsSync(path.join(CORE_PLUGINS_DIR, `${name}.js`))) return { source: 'core' };
  const npmPackage = npmPackageFor(name);
  if (npmPackage && fs.existsSync(path.join(NODE_MODULES, npmPackage))) {
    return { source: 'installed', npmPackage };
  }
  return { source: 'missing', npmPackage };
}

// First token of a line, ignoring an optional leading '#'.
function firstToken(line: string): string | null {
  const rest = line.replace(/^\s*#?\s*/, '').trim();
  if (!rest) return null;
  const token = rest.split(/\s+/)[0];
  return SAFE_NAME.test(token) ? token : null;
}

/** Raw enable/disable state parsed from config/plugins. Active (uncommented)
 *  lines are always real plugins; commented lines only count when they name a
 *  known plugin, so documentation prose in comments is never mistaken for one. */
export function readPlugins(): PluginEntry[] {
  const lines = readRaw('plugins').split(/\r?\n/);
  const out: PluginEntry[] = [];
  for (const line of lines) {
    const commented = /^\s*#/.test(line);
    const token = firstToken(line);
    if (!token) continue;
    if (commented && !CATALOG_NAMES.has(token)) continue; // skip prose comments
    if (out.find((p) => p.name === token)) continue;
    out.push({ name: token, enabled: !commented });
  }
  return out;
}

/** Catalog merged with the current enabled state; unknown-but-present plugins
 *  are appended so nothing the server actually runs is hidden from the admin. */
export function listPlugins(): PluginListItem[] {
  const enabledByName = new Map(readPlugins().map((p) => [p.name, p.enabled]));

  const items: PluginListItem[] = PLUGIN_CATALOG.map((info) => {
    const { source, npmPackage } = resolveSource(info.name);
    return {
      ...info,
      enabled: enabledByName.get(info.name) ?? false,
      configExists: info.configFile ? fs.existsSync(configPath(info.configFile)) : false,
      source,
      available: source !== 'missing',
      npmPackage,
    };
  });

  const known = new Set(PLUGIN_CATALOG.map((p) => p.name));
  for (const [name, enabled] of enabledByName) {
    if (known.has(name)) continue;
    const { source, npmPackage } = resolveSource(name);
    items.push({
      name,
      label: name,
      category: 'Other',
      description: 'Custom or unrecognised plugin found in config/plugins.',
      configFile: '',
      docsUrl: `https://haraka.github.io/plugins/${name}`,
      enabled,
      configExists: false,
      source,
      available: source !== 'missing',
      npmPackage,
    });
  }
  return items;
}

export function setPlugin(name: string, enabled: boolean): PluginListItem[] {
  if (!SAFE_NAME.test(name)) throw new Error(`Invalid plugin name: ${name}`);
  const known = getCatalogEntry(name) || readPlugins().some((p) => p.name === name);
  if (!known) throw new Error(`Unknown plugin: ${name}`);

  // Never enable a plugin whose code is not present - Haraka aborts at startup
  // if config/plugins names a plugin it cannot load.
  if (enabled) {
    const { source, npmPackage } = resolveSource(name);
    if (source === 'missing') {
      const hint = npmPackage ? ` Install it first: npm install ${npmPackage}` : '';
      throw new Error(`Plugin "${name}" is not installed.${hint}`);
    }
  }

  const lines = readRaw('plugins').split(/\r?\n/);
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (firstToken(lines[i]) !== name) continue;
    found = true;
    const rest = lines[i].replace(/^\s*#?\s*/, '');
    lines[i] = enabled ? rest : `#${rest}`;
    break;
  }
  if (!found && enabled) lines.push(name);
  writeRaw('plugins', lines.join('\n'));
  return listPlugins();
}

/** Resolve the config file for a plugin from the trusted catalog only. */
function resolveConfigFile(name: string): string {
  const entry = getCatalogEntry(name);
  if (!entry) throw new Error(`Unknown plugin: ${name}`);
  if (!entry.configFile) throw new Error(`${name} has no editable config file`);
  return entry.configFile;
}

export function readPluginConfig(name: string): PluginConfigFile {
  const configFile = resolveConfigFile(name);
  const p = configPath(configFile);
  const exists = fs.existsSync(p);
  return { name, configFile, exists, content: exists ? fs.readFileSync(p, 'utf8') : '' };
}

// Haraka watches its config files and reloads them automatically, so simply
// writing the file applies the change without a restart (enabling/disabling a
// plugin still needs a restart because that changes the plugin list itself).
export function writePluginConfig(name: string, content: string): PluginConfigFile {
  const configFile = resolveConfigFile(name);
  writeRaw(configFile, content);
  return readPluginConfig(name);
}
