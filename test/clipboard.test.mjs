import assert from 'node:assert/strict';
import test from 'node:test';
import { copyExportText, plainTextExport } from '../extension/clipboard.js';

test('plainTextExport retains selected message roles, timestamps, and citation URLs', () => {
  assert.equal(plainTextExport({
    title: 'Research',
    messages: [{ role: 'assistant', timestamp: '2026-11-25T03:00:00Z', text: 'Claim [Source](https://example.com/report)' }],
  }), 'Research\n\nChatGPT (2026-11-25T03:00:00Z):\nClaim [Source](https://example.com/report)');
});

test('copyExportText writes only to the provided local clipboard', async () => {
  let copied = '';
  await copyExportText({ title: 'Notes', messages: [{ role: 'user', text: 'Keep this' }] }, { writeText: async (text) => { copied = text; } });
  assert.equal(copied, 'Notes\n\nYou:\nKeep this');
});
