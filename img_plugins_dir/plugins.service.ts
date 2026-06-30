// Plugins domain: toggle entries in config/plugins (line-oriented list) and
// read/write each plugin's own config file via the trusted catalog.
import fs from 'node:fs';
import { readRaw, writeRaw, configPath } from '../../core/files';
import { PLUGIN_CATALOG, getCatalogEntry, type PluginInfo } from './plugin-catalog';

export interface PluginEntry {
  name: string;
  enabled: boolean;
}

/** Catalog metadata + runtime state for the UI. */
export interface PluginListItem extends PluginInfo {
  enabled: boolean;
  configExists: boolean;
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

  const items: PluginListItem[] = PLUGIN_CATALOG.map((info) => ({
    ...info,
    enabled: enabledByName.get(info.name) ?? false,
    configExists: info.configFile ? fs.existsSync(configPath(info.configFile)) : false,
  }));

  const known = new Set(PLUGIN_CATALOG.map((p) => p.name));
  for (const [name, enabled] of enabledByName) {
    if (known.has(name)) continue;
    items.push({
      name,
      label: name,
      category: 'Other',
      description: 'Custom or unrecognised plugin found in config/plugins.',
      configFile: '',
      docsUrl: `https://haraka.github.io/plugins/${name}`,
      enabled,
      configExists: false,
    });
  }
  return items;
}

export function setPlugin(name: string, enabled: boolean): PluginListItem[] {
  if (!SAFE_NAME.test(name)) throw new Error(`Invalid plugin name: ${name}`);
  const known = getCatalogEntry(name) || readPlugins().some((p) => p.name === name);
  if (!known) throw new Error(`Unknown plugin: ${name}`);

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
