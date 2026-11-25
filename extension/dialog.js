export const DEFAULT_OPTIONS = Object.freeze({
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

export function normalizeOptions(options = {}) {
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

export function serializeOptions(root) {
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

export function createDialog(snapshot = { messages: [] }) {
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
