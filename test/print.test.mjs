import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { buildPrintMarkup, escapeHtml, pageStyle } from '../extension/print.js';

test('print markup renders title, messages, and requested layout attributes', () => {
  const markup = buildPrintMarkup({
    title: 'Roadmap <Q4>',
    messages: [{ role: 'user', html: '<p>Question</p>' }, { role: 'assistant', html: '<pre><code>answer</code></pre>', timestamp: '2026-11-25T03:00:00Z' }],
  }, { theme: 'dark', pageSize: 'Letter', margins: 'wide', title: 'Custom title', fontSize: 16, pageBreakPairs: true });
  assert.match(markup, /data-theme="dark"/);
  assert.match(markup, /data-page-break-pairs="true"/);
  assert.match(markup, /--message-font-size: 16px/);
  assert.match(markup, /class="message-time">2026-11-25T03:00:00Z/);
  assert.match(markup, /<h1>Custom title<\/h1>/);
  assert.match(markup, /class="message message-user"/);
  assert.match(markup, /<pre><code>answer<\/code><\/pre>/);
});

test('print helpers escape untrusted plain title text and map page styles', () => {
  assert.equal(escapeHtml('<x>&'), '&lt;x&gt;&amp;');
  assert.equal(pageStyle({ pageSize: 'A4', margins: 'compact', orientation: 'landscape', pageNumbers: true }), '@page { size: A4 landscape; margin: 10mm; @bottom-center { content: counter(page); font: 10px system-ui; color: #6b7280; } }');
  assert.doesNotMatch(pageStyle({ pageNumbers: false }), /counter\(page\)/);
});

test('print stylesheet protects important blocks from avoidable splits', () => {
  const css = fs.readFileSync(new URL('../extension/print.css', import.meta.url), 'utf8');
  for (const selector of ['.message', 'pre', 'table', 'tr', 'img']) {
    assert.match(css, new RegExp(`${selector.replace('.', '\\.')}(?:,|\\s|\\{)[\\s\\S]{0,200}(?:break-inside:\\s*avoid|page-break-inside:\\s*avoid)`));
  }
});
