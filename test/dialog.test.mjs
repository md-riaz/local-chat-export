import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_OPTIONS, normalizeOptions, serializeOptions } from '../extension/dialog.js';

test('normalizeOptions accepts supported presentation choices', () => {
  assert.deepEqual(normalizeOptions({ theme: 'dark', pageSize: 'Letter', margins: 'wide', title: '  Sprint plan ', pageBreakPairs: true }), {
    theme: 'dark', pageSize: 'Letter', margins: 'wide', title: 'Sprint plan', pageBreakPairs: true,
  });
});

test('normalizeOptions falls back to safe local defaults', () => {
  assert.deepEqual(normalizeOptions({ theme: 'remote', pageSize: 'huge', margins: 'zero', title: '', pageBreakPairs: 'yes' }), DEFAULT_OPTIONS);
});

test('serializeOptions reads accessible dialog controls', () => {
  const values = { theme: 'dark', pageSize: 'A4', margins: 'compact', title: 'Notes', pageBreakPairs: true };
  const root = { querySelector(selector) { const key = selector.match(/\[name="(.+)"\]/)[1]; return { value: values[key], checked: values[key] }; } };
  assert.deepEqual(serializeOptions(root), values);
});
