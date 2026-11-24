import { consumePayload } from './payload.js';
import { buildPrintMarkup, pageStyle } from './print.js';

const root = document.getElementById('print-root');
const id = new URLSearchParams(location.search).get('id');
const payload = id ? await consumePayload(chrome.storage.session, id) : null;

if (!payload?.snapshot?.messages?.length) {
  root.textContent = 'This local export is unavailable or has expired. Return to ChatGPT and export again.';
} else {
  document.title = `${payload.options.title || payload.snapshot.title || 'ChatGPT conversation'} · Local export`;
  const style = document.createElement('style');
  style.textContent = pageStyle(payload.options);
  document.head.append(style);
  root.outerHTML = buildPrintMarkup(payload.snapshot, payload.options);
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
}
