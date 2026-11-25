export function plainTextExport(snapshot) {
  const title = snapshot.title?.trim() || 'ChatGPT conversation';
  const messages = (snapshot.messages ?? []).map(({ role, text, timestamp }) => {
    const author = role === 'user' ? 'You' : 'ChatGPT';
    return `${author}${timestamp ? ` (${timestamp})` : ''}:\n${text?.trim() || ''}`;
  });
  return [title, ...messages].join('\n\n').trim();
}

export async function copyExportText(snapshot, clipboard = navigator.clipboard) {
  if (!clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.');
  await clipboard.writeText(plainTextExport(snapshot));
}
