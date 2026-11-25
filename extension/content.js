import { createDialog, serializeOptions } from './dialog.js';
import { captureConversation, selectMessages } from './capture.js';

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
  form.querySelector('[name="title"]').focus();
  dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => dialog.remove());
  dialog.querySelector('[data-action="select-all"]').addEventListener('click', () => {
    form.querySelectorAll('[name="message"]').forEach((input) => { input.checked = true; });
  });
  dialog.querySelector('[data-action="select-none"]').addEventListener('click', () => {
    form.querySelectorAll('[name="message"]').forEach((input) => { input.checked = false; });
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
