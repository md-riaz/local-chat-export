const MESSAGE_SELECTORS = [
  '[data-message-author-role="user"]',
  '[data-message-author-role="assistant"]',
  '[data-message-author-role="tool"]',
  'article[data-testid^="conversation-turn-"]',
];

const BLOCKED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'NOSCRIPT']);
const URL_ATTRIBUTES = new Set(['href', 'src', 'srcset']);

export function titleFromDocument(documentLike) {
  const heading = documentLike.querySelector?.('main h1, [data-testid="conversation-title"]')?.textContent?.trim();
  const documentTitle = documentLike.title?.replace(/\s*[·|]\s*ChatGPT\s*$/i, '').trim();
  return heading || documentTitle || 'ChatGPT conversation';
}

export function sanitizeMessageHtml(source) {
  const clone = source.cloneNode(true);
  const nodes = [clone, ...(clone.querySelectorAll?.('*') ?? [])];
  for (const node of nodes) {
    if (BLOCKED_TAGS.has(node.tagName)) {
      node.remove();
      continue;
    }
    for (const attribute of [...(node.attributes ?? [])]) {
      const name = attribute.name ?? attribute[0];
      const value = attribute.value ?? attribute[1] ?? '';
      if (/^on/i.test(name) || (URL_ATTRIBUTES.has(name.toLowerCase()) && /^\s*(javascript|data:text\/html):/i.test(value))) {
        node.removeAttribute(name);
      }
    }
  }
  // The browser DOM path above is the primary sanitizer. Keep this small final
  // guard for malformed markup and for test/non-DOM environments.
  return clone.innerHTML
    .replace(/<\/?(?:script|style|iframe|object|embed|form|input|button|noscript)\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(?:href|src|srcset)\s*=\s*(?:"\s*(?:javascript|data:text\/html):[^"]*"|'\s*(?:javascript|data:text\/html):[^']*'|\s*(?:javascript|data:text\/html):[^\s>]*)/gi, '');
}

export function messageRole(element) {
  const explicit = element.getAttribute?.('data-message-author-role');
  if (explicit) return explicit;
  const accessible = element.getAttribute?.('aria-label')?.toLowerCase() ?? '';
  return accessible.includes('you') ? 'user' : 'assistant';
}

export function messageTimestamp(element) {
  const time = element.querySelector?.('time[datetime], time') ?? null;
  return time?.getAttribute?.('datetime') || time?.textContent?.trim() || '';
}

export function selectMessages(messages = [], selectedIndexes = []) {
  const selected = new Set(selectedIndexes.map(Number).filter((index) => Number.isInteger(index) && index >= 0 && index < messages.length));
  return messages.filter((_, index) => selected.has(index));
}

export function captureConversation(documentLike = document) {
  const seen = new Set();
  const candidates = MESSAGE_SELECTORS.flatMap((selector) => [...documentLike.querySelectorAll(selector)]);
  const messages = candidates
    .filter((element) => !seen.has(element) && seen.add(element))
    .filter((element) => element.textContent?.trim())
    .map((element) => {
      const timestamp = messageTimestamp(element);
      return {
        role: messageRole(element),
        html: sanitizeMessageHtml(element),
        text: element.textContent.trim(),
        ...(timestamp ? { timestamp } : {}),
      };
    });
  return { title: titleFromDocument(documentLike), messages };
}
