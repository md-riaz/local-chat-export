import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('extension/manifest.json', root)));

test('manifest loads one classic bundled content script', () => {
  assert.deepEqual(manifest.content_scripts[0].js, ['content-script.js']);
  const bundle = fs.readFileSync(new URL('extension/content-script.js', root), 'utf8');
  assert.doesNotMatch(bundle, /^\s*(?:import|export)\s/m);
  assert.match(bundle, /function captureConversation\(/);
  assert.match(bundle, /function createDialog\(/);
  assert.match(bundle, /function copyExportText\(/);
  assert.match(bundle, /function installButton\(/);
});
