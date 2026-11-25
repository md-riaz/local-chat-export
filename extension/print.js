export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function pageStyle({ pageSize = 'A4', margins = 'normal', orientation = 'portrait', pageNumbers = true } = {}) {
  const margin = { compact: '10mm', normal: '16mm', wide: '22mm' }[margins] ?? '16mm';
  const size = pageSize === 'Letter' ? 'Letter' : 'A4';
  const pageNumber = pageNumbers === false ? '' : ' @bottom-center { content: counter(page); font: 10px system-ui; color: #6b7280; }';
  return `@page { size: ${size} ${orientation === 'landscape' ? 'landscape' : 'portrait'}; margin: ${margin};${pageNumber} }`;
}

export function buildPrintMarkup(snapshot, options) {
  const title = options.title || snapshot.title || 'ChatGPT conversation';
  const messages = snapshot.messages.map(({ role, html, timestamp }) => `
    <section class="message message-${role === 'user' ? 'user' : 'assistant'}">
      <div class="avatar" aria-hidden="true">${role === 'user' ? 'You' : 'AI'}</div>
      <div class="message-content">${html}${timestamp ? `<time class="message-time">${escapeHtml(timestamp)}</time>` : ''}</div>
    </section>`).join('');
  return `<main class="export" data-theme="${options.theme}" data-page-break-pairs="${options.pageBreakPairs}" style="--message-font-size: ${Number(options.fontSize) || 15}px">
    <header class="export-header"><div class="eyebrow">LOCAL CHAT EXPORT</div><h1>${escapeHtml(title)}</h1><p>Generated locally in your browser</p></header>
    <article class="conversation">${messages}</article>
  </main>`;
}
