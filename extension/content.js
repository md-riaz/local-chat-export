import { createDialog, serializeOptions } from './dialog.js';
import { captureConversation } from './capture.js';

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
  const dialog = createDialog();
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  form.querySelector('[name="title"]').value = captureConversation(document).title;
  form.querySelector('[name="title"]').focus();
  dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => dialog.remove());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const snapshot = captureConversation(document);
    if (!snapshot.messages.length) {
      dialog.remove();
      showError('No visible conversation messages found on this page.');
      return;
    }
    const options = serializeOptions(form);
    chrome.runtime.sendMessage({ type: 'local-export:create', payload: { snapshot, options } }, (response) => {
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
