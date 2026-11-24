import { createPayloadId } from './payload.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'local-export:create' || !sender.tab?.id) return;
  createPayloadId(chrome.storage.session, message.payload)
    .then((id) => chrome.tabs.create({ url: chrome.runtime.getURL(`print.html?id=${encodeURIComponent(id)}`), active: true }))
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
