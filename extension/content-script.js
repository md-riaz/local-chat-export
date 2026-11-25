// Source: capture.js
const MESSAGE_SELECTORS = [
  '[data-message-author-role="user"]',
  '[data-message-author-role="assistant"]',
  '[data-message-author-role="tool"]',
  'article[data-testid^="conversation-turn-"]',
];

const BLOCKED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'NOSCRIPT']);
const URL_ATTRIBUTES = new Set(['href', 'src', 'srcset']);

function titleFromDocument(documentLike) {
  const heading = documentLike.querySelector?.('main h1, [data-testid="conversation-title"]')?.textContent?.trim();
  const documentTitle = documentLike.title?.replace(/\s*[·|]\s*ChatGPT\s*$/i, '').trim();
  return heading || documentTitle || 'ChatGPT conversation';
}

function sanitizeMessageHtml(source) {
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

function messageRole(element) {
  const explicit = element.getAttribute?.('data-message-author-role');
  if (explicit) return explicit;
  const accessible = element.getAttribute?.('aria-label')?.toLowerCase() ?? '';
  return accessible.includes('you') ? 'user' : 'assistant';
}

function messageTimestamp(element) {
  const time = element.querySelector?.('time[datetime], time') ?? null;
  return time?.getAttribute?.('datetime') || time?.textContent?.trim() || '';
}

function selectMessages(messages = [], selectedIndexes = []) {
  const selected = new Set(selectedIndexes.map(Number).filter((index) => Number.isInteger(index) && index >= 0 && index < messages.length));
  return messages.filter((_, index) => selected.has(index));
}

function captureConversation(documentLike = document) {
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


// Source: dialog.js
const DEFAULT_OPTIONS = Object.freeze({
  theme: 'light',
  pageSize: 'A4',
  margins: 'normal',
  title: '',
  filename: '',
  orientation: 'portrait',
  fontSize: 15,
  pageNumbers: true,
  pageBreakPairs: false,
});

const THEMES = new Set(['light', 'dark']);
const PAGE_SIZES = new Set(['A4', 'Letter']);
const MARGINS = new Set(['compact', 'normal', 'wide']);
const ORIENTATIONS = new Set(['portrait', 'landscape']);
const FONT_SIZES = new Set([13, 14, 15, 16, 17, 18]);

function normalizeFilename(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').slice(0, 120);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function normalizeOptions(options = {}) {
  const title = typeof options.title === 'string' ? options.title.trim() : '';
  const normalized = {
    theme: THEMES.has(options.theme) ? options.theme : DEFAULT_OPTIONS.theme,
    pageSize: PAGE_SIZES.has(options.pageSize) ? options.pageSize : DEFAULT_OPTIONS.pageSize,
    margins: MARGINS.has(options.margins) ? options.margins : DEFAULT_OPTIONS.margins,
    title,
    filename: normalizeFilename(options.filename),
    orientation: ORIENTATIONS.has(options.orientation) ? options.orientation : DEFAULT_OPTIONS.orientation,
    fontSize: FONT_SIZES.has(Number(options.fontSize)) ? Number(options.fontSize) : DEFAULT_OPTIONS.fontSize,
    pageNumbers: options.pageNumbers !== false,
    pageBreakPairs: options.pageBreakPairs === true,
  };
  return title || !options.title ? normalized : { ...normalized, title: '' };
}

function serializeOptions(root) {
  return normalizeOptions({
    theme: root.querySelector('[name="theme"]').value,
    pageSize: root.querySelector('[name="pageSize"]').value,
    margins: root.querySelector('[name="margins"]').value,
    title: root.querySelector('[name="title"]').value,
    filename: root.querySelector('[name="filename"]').value,
    orientation: root.querySelector('[name="orientation"]').value,
    fontSize: root.querySelector('[name="fontSize"]').value,
    pageNumbers: root.querySelector('[name="pageNumbers"]').checked,
    pageBreakPairs: root.querySelector('[name="pageBreakPairs"]').checked,
  });
}

function createDialog(snapshot = { messages: [] }) {
  const messages = snapshot.messages ?? [];
  const selection = messages.map(({ role, text }, index) => `
        <label class="lce-message-choice"><input name="message" type="checkbox" value="${index}" checked><span class="lce-role">${role === 'user' ? 'You' : 'ChatGPT'}</span><span>${escapeHtml(text)}</span></label>`).join('');
  const host = document.createElement('section');
  host.className = 'lce-dialog';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  host.setAttribute('aria-label', 'Export conversation locally');
  host.innerHTML = `
    <form class="lce-card">
      <div class="lce-heading"><span aria-hidden="true">↓</span><div><h2>Export conversation</h2><p>Created locally in this browser.</p></div></div>
      <fieldset class="lce-selection"><legend>Messages to export</legend><div class="lce-selection-actions"><button type="button" data-action="select-all">All</button><button type="button" data-action="select-none">None</button></div><div class="lce-message-list">${selection}</div></fieldset>
      <label>Title<input name="title" type="text" autocomplete="off" placeholder="Conversation title"></label>
      <label>PDF filename<input name="filename" type="text" autocomplete="off" placeholder="Defaults to title"></label>
      <div class="lce-grid">
        <label>Theme<select name="theme"><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <label>Paper<select name="pageSize"><option value="A4">A4</option><option value="Letter">Letter</option></select></label>
        <label>Margins<select name="margins"><option value="compact">Compact</option><option value="normal" selected>Normal</option><option value="wide">Wide</option></select></label>
        <label>Orientation<select name="orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        <label>Text size<select name="fontSize"><option value="13">Small</option><option value="14">Compact</option><option value="15" selected>Normal</option><option value="16">Large</option><option value="17">Larger</option><option value="18">Largest</option></select></label>
      </div>
      <label class="lce-check"><input name="pageNumbers" type="checkbox" checked> Show page numbers</label>
      <label class="lce-check"><input name="pageBreakPairs" type="checkbox"> Start each prompt on a new page</label>
      <p class="lce-note">Chrome will open its native print screen. Choose “Save to PDF”.</p>
      <div class="lce-actions"><button type="button" data-action="cancel">Cancel</button><button type="button" data-action="copy">Copy text</button><button class="lce-primary" type="submit">Open print view</button></div>
    </form>`;
  return host;
}


// Source: clipboard.js
function plainTextExport(snapshot) {
  const title = snapshot.title?.trim() || 'ChatGPT conversation';
  const messages = (snapshot.messages ?? []).map(({ role, text, timestamp }) => {
    const author = role === 'user' ? 'You' : 'ChatGPT';
    return `${author}${timestamp ? ` (${timestamp})` : ''}:\n${text?.trim() || ''}`;
  });
  return [title, ...messages].join('\n\n').trim();
}

async function copyExportText(snapshot, clipboard = navigator.clipboard) {
  if (!clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.');
  await clipboard.writeText(plainTextExport(snapshot));
}


// Source: content.js
const BUTTON_ID = 'local-chat-export-trigger';

function showError(message) {
  const notice = document.createElement('div');
  notice.className = 'lce-toast';
  notice.setAttribute('role', 'alert');
  notice.textContent = message;
  document.body.append(notice);
  setTimeout(() => notice.remove(), 4500);
}

function openDialog() {
  if (document.querySelector('.lce-dialog')) return;
  const snapshot = captureConversation(document);
  if (!snapshot.messages.length) {
    showError('No visible conversation messages found on this page.');
    return;
  }
  const dialog = createDialog(snapshot);
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  form.querySelector('[name="title"]').value = snapshot.title;
  form.querySelector('[name="filename"]').value = snapshot.title;
  form.querySelector('[name="title"]').focus();
  dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => dialog.remove());
  dialog.querySelector('[data-action="select-all"]').addEventListener('click', () => {
    form.querySelectorAll('[name="message"]').forEach((input) => { input.checked = true; });
  });
  dialog.querySelector('[data-action="select-none"]').addEventListener('click', () => {
    form.querySelectorAll('[name="message"]').forEach((input) => { input.checked = false; });
  });
  dialog.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const selectedIndexes = [...form.querySelectorAll('[name="message"]:checked')].map((input) => input.value);
    const messages = selectMessages(snapshot.messages, selectedIndexes);
    if (!messages.length) return showError('Select at least one message to copy.');
    try {
      await copyExportText({ ...snapshot, messages });
      showError('Copied selected conversation text.');
    } catch (error) {
      showError(error.message);
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedIndexes = [...form.querySelectorAll('[name="message"]:checked')].map((input) => input.value);
    const messages = selectMessages(snapshot.messages, selectedIndexes);
    if (!messages.length) {
      showError('Select at least one message to export.');
      return;
    }
    const options = serializeOptions(form);
    chrome.runtime.sendMessage({ type: 'local-export:create', payload: { snapshot: { ...snapshot, messages }, options } }, (response) => {
      if (!response?.ok) showError(response?.error || 'Could not open the local print view.');
    });
    dialog.remove();
  });
}

function installButton() {
  if (document.getElementById(BUTTON_ID)) return;
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.className = 'lce-export-button';
  button.setAttribute('aria-label', 'Export this conversation locally');
  button.innerHTML = '<span aria-hidden="true">↓</span><span>Export</span>';
  button.addEventListener('click', openDialog);
  document.body.append(button);
}

installButton();

