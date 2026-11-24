import assert from 'node:assert/strict';
import test from 'node:test';
import { captureConversation, sanitizeMessageHtml } from '../extension/capture.js';

class ElementMock {
  constructor({ tagName = 'div', attributes = {}, textContent = '', innerHTML = '', children = [] } = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.textContent = textContent;
    this.innerHTML = innerHTML;
    this.children = children;
  }

  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  remove() { this.removed = true; }
  querySelectorAll() { return []; }
  cloneNode() { return new ElementMock({ tagName: this.tagName, attributes: Object.fromEntries(this.attributes), textContent: this.textContent, innerHTML: this.innerHTML }); }
}

test('captureConversation returns title and ordered visible role messages', () => {
  const user = new ElementMock({ attributes: { 'data-message-author-role': 'user' }, innerHTML: '<p>Hello</p>', textContent: 'Hello' });
  const assistant = new ElementMock({ attributes: { 'data-message-author-role': 'assistant' }, innerHTML: '<pre><code>const x = 1;</code></pre>', textContent: 'const x = 1;' });
  const documentMock = {
    title: 'Planning · ChatGPT',
    querySelector: () => null,
    querySelectorAll: (selector) => selector.includes('data-message-author-role') ? [user, assistant] : [],
  };

  assert.deepEqual(captureConversation(documentMock), {
    title: 'Planning',
    messages: [
      { role: 'user', html: '<p>Hello</p>', text: 'Hello' },
      { role: 'assistant', html: '<pre><code>const x = 1;</code></pre>', text: 'const x = 1;' },
    ],
  });
});

test('captureConversation returns no messages when no supported messages are visible', () => {
  assert.deepEqual(captureConversation({ title: 'ChatGPT', querySelector: () => null, querySelectorAll: () => [] }), {
    title: 'ChatGPT',
    messages: [],
  });
});

test('sanitizeMessageHtml drops active and unsafe markup while retaining readable content', () => {
  const source = new ElementMock({ innerHTML: '<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(2)">bad</a>' });
  const sanitized = sanitizeMessageHtml(source);
  assert.match(sanitized, /<p>Hello<\/p>/);
  assert.doesNotMatch(sanitized, /script|onclick|javascript:/i);
});
