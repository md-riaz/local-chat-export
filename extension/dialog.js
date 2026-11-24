export const DEFAULT_OPTIONS = Object.freeze({
  theme: 'light',
  pageSize: 'A4',
  margins: 'normal',
  title: '',
  pageBreakPairs: false,
});

const THEMES = new Set(['light', 'dark']);
const PAGE_SIZES = new Set(['A4', 'Letter']);
const MARGINS = new Set(['compact', 'normal', 'wide']);

export function normalizeOptions(options = {}) {
  const title = typeof options.title === 'string' ? options.title.trim() : '';
  const normalized = {
    theme: THEMES.has(options.theme) ? options.theme : DEFAULT_OPTIONS.theme,
    pageSize: PAGE_SIZES.has(options.pageSize) ? options.pageSize : DEFAULT_OPTIONS.pageSize,
    margins: MARGINS.has(options.margins) ? options.margins : DEFAULT_OPTIONS.margins,
    title,
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
    pageBreakPairs: root.querySelector('[name="pageBreakPairs"]').checked,
  });
}

export function createDialog() {
  const host = document.createElement('section');
  host.className = 'lce-dialog';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  host.setAttribute('aria-label', 'Export conversation locally');
  host.innerHTML = `
    <form class="lce-card">
      <div class="lce-heading"><span aria-hidden="true">↓</span><div><h2>Export conversation</h2><p>Created locally in this browser.</p></div></div>
      <label>Title<input name="title" type="text" autocomplete="off" placeholder="Conversation title"></label>
      <div class="lce-grid">
        <label>Theme<select name="theme"><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <label>Paper<select name="pageSize"><option value="A4">A4</option><option value="Letter">Letter</option></select></label>
        <label>Margins<select name="margins"><option value="compact">Compact</option><option value="normal" selected>Normal</option><option value="wide">Wide</option></select></label>
      </div>
      <label class="lce-check"><input name="pageBreakPairs" type="checkbox"> Start each prompt on a new page</label>
      <p class="lce-note">Chrome will open its native print screen. Choose “Save to PDF”.</p>
      <div class="lce-actions"><button type="button" data-action="cancel">Cancel</button><button class="lce-primary" type="submit">Open print view</button></div>
    </form>`;
  return host;
}
