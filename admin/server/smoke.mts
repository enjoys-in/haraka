import {
  listTemplates,
  createCustomPlugin,
  listCustomPlugins,
  readCustomPlugin,
  setCustomPluginEnabled,
  writeCustomPlugin,
  removeCustomPlugin,
} from './src/domains/custom-plugins/customPlugins.service';
import { readRaw } from './src/core/files';

console.log('templates:', listTemplates().map((t) => t.id).join(', '));

const created = createCustomPlugin('smoke_test', 'rcpt', true);
console.log('created -> enabled?', created.enabled, 'size', created.size);
console.log('--- config/plugins after create ---\n' + readRaw('plugins'));

console.log('list:', listCustomPlugins().map((p) => `${p.name}:${p.enabled}`).join(', '));

setCustomPluginEnabled('smoke_test', false);
console.log('after disable -> enabled?', readCustomPlugin('smoke_test').enabled);

writeCustomPlugin('smoke_test', '// edited\nexports.hook_rcpt = (next) => next();\n');
console.log('first line after edit:', readCustomPlugin('smoke_test').content.split('\n')[0]);

try {
  createCustomPlugin('inbound_notify', 'rcpt', false);
  console.log('RESERVED NOT BLOCKED (bug)');
} catch (e) {
  console.log('reserved blocked:', (e as Error).message);
}

try {
  createCustomPlugin('../evil', 'rcpt', false);
  console.log('TRAVERSAL NOT BLOCKED (bug)');
} catch (e) {
  console.log('traversal blocked:', (e as Error).message);
}

removeCustomPlugin('smoke_test');
console.log('after delete list:', JSON.stringify(listCustomPlugins().map((p) => p.name)));
console.log('--- config/plugins after delete ---\n' + readRaw('plugins'));
