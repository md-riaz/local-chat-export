export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function pageStyle({ pageSize = 'A4', margins = 'normal' } = {}) {
  const margin = { compact: '10mm', normal: '16mm', wide: '22mm' }[margins] ?? '16mm';
  const size = pageSize === 'Letter' ? 'Letter' : 'A4';
  return `@page { size: ${size}; margin: ${margin}; }`;
}

export function buildPrintMarkup(snapshot, options) {
  const title = options.title || snapshot.title || 'ChatGPT conversation';
  const messages = snapshot.messages.map(({ role, html }) => `
    <section class="message message-${role === 'user' ? 'user' : 'assistant'}">
      <div class="avatar" aria-hidden="true">${role === 'user' ? 'You' : 'AI'}</div>
      <div class="message-content">${html}</div>
    </section>`).join('');
  return `<main class="export" data-theme="${options.theme}" data-page-break-pairs="${options.pageBreakPairs}">
    <header class="export-header"><div class="eyebrow">LOCAL CHAT EXPORT</div><h1>${escapeHtml(title)}</h1><p>Generated locally in your browser</p></header>
    <article class="conversation">${messages}</article>
  </main>`;
}
