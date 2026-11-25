import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../extension/manifest.json', import.meta.url)));

test('manifest is a restricted Manifest V3 ChatGPT extension', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.host_permissions, [
    'https://chatgpt.com/*',
    'https://chat.openai.com/*',
  ]);
  assert.deepEqual(manifest.content_scripts[0].matches, manifest.host_permissions);
  assert.deepEqual(manifest.content_scripts[0].js, ['content-script.js']);
  assert.equal(manifest.action.default_title, 'Export conversation locally');
});
