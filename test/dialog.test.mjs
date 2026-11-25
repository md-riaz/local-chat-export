import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_OPTIONS, normalizeOptions, serializeOptions } from '../extension/dialog.js';

test('normalizeOptions accepts PDF filename and print presentation choices', () => {
  assert.deepEqual(normalizeOptions({
    theme: 'dark', pageSize: 'Letter', margins: 'wide', title: '  Sprint plan ', filename: '  q4-plan.pdf  ',
    orientation: 'landscape', fontSize: '16', pageNumbers: false, pageBreakPairs: true,
  }), {
    theme: 'dark', pageSize: 'Letter', margins: 'wide', title: 'Sprint plan', filename: 'q4-plan',
    orientation: 'landscape', fontSize: 16, pageNumbers: false, pageBreakPairs: true,
  });
});

test('normalizeOptions falls back to safe local defaults', () => {
  assert.deepEqual(normalizeOptions({ theme: 'remote', pageSize: 'huge', margins: 'zero', title: '', pageBreakPairs: 'yes' }), DEFAULT_OPTIONS);
});

test('serializeOptions reads accessible dialog controls', () => {
  const values = {
    theme: 'dark', pageSize: 'A4', margins: 'compact', title: 'Notes', filename: 'notes.pdf', orientation: 'landscape',
    fontSize: '17', pageNumbers: false, pageBreakPairs: true,
  };
  const root = { querySelector(selector) { const key = selector.match(/\[name="(.+)"\]/)[1]; return { value: values[key], checked: values[key] }; } };
  assert.deepEqual(serializeOptions(root), {
    theme: 'dark', pageSize: 'A4', margins: 'compact', title: 'Notes', filename: 'notes', orientation: 'landscape',
    fontSize: 17, pageNumbers: false, pageBreakPairs: true,
  });
});
