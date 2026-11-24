# Local Chat Export

A clean-room, local-only Chrome extension that creates a print-quality export of the ChatGPT conversation currently visible in your browser.

## Privacy

- No server, API, account, analytics, tracking, payment, or quota.
- The extension reads only the visible conversation DOM on `chatgpt.com` and `chat.openai.com`.
- A one-time snapshot moves through `chrome.storage.session` to a local extension print tab, then is removed.
- No conversation HTML is placed in a URL or sent off-device.

## PDF workflow

Chrome does not allow a normal extension to silently save a PDF. This extension opens a local print view and calls the native print workflow. In Chrome print preview choose **Save to PDF**. Native printing retains selectable text and produces substantially better tables, code blocks, and pagination than canvas-based PDF export.

## Load unpacked

1. Run `npm test` from this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select [`extension/`](./extension).
6. Open a ChatGPT conversation and use the green **Export** button.

The export dialog lets you choose light/dark theme, A4/Letter paper, margins, title, and prompt page breaks.

## Development

```bash
npm test
npm run verify:local
npx openspec validate add-local-chatgpt-pdf-exporter --strict
```

No package is required at runtime. `@fission-ai/openspec` is development-only and records the implementation specification in `openspec/`.

## Known limits

- This is a clean-room layout inspired by modern chat interfaces, not an official ChatGPT brand or asset copy.
- ChatGPT DOM changes can affect message discovery.
- Embedded content whose source page requires its own external styles can only be preserved best-effort in an offline print document.
