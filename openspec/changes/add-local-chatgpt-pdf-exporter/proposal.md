# Proposal

## Why

ChatGPT conversation exporters commonly send rendered conversation HTML to a vendor service for PDF generation, create account dependencies, and limit exports by quota. A local-only exporter lets a user create a print-quality PDF from the conversation currently visible in their own browser without transmitting the content, requiring an account, or imposing an artificial export limit.

## What Changes

- Add a Manifest V3 Chrome extension that runs only on `chatgpt.com` and `chat.openai.com` conversation pages.
- Add an on-page export action that extracts the visible conversation into an isolated extension print document.
- Render semantic message sections with a ChatGPT-inspired, clean-room light or dark layout, preserving headings, paragraphs, lists, code blocks, tables, links, images, and mathematical markup already rendered by the page.
- Use Chrome's native print preview for PDF creation, with print CSS that prevents avoidable splits in message cards, code blocks, tables, and images.
- Add client-side user controls for theme, page size, margins, title, and optional prompt-response page breaks.
- Keep all processing local: no remote API, analytics, login, telemetry, quota, or payment flow.

## Capabilities

### New Capabilities
- `conversation-capture`: Capture the current ChatGPT conversation into an export-safe local document.
- `print-pdf-export`: Produce a paginated, print-ready export document through the browser's native PDF workflow.
- `local-export-controls`: Provide local export settings and an accessible in-page export trigger.
- `local-only-privacy`: Guarantee that export processing performs no network requests, authentication, telemetry, or quota checks.

### Modified Capabilities
- None.

## Impact

- Adds a standalone Chrome Manifest V3 extension under `extension/`.
- Adds static HTML, CSS, and JavaScript with no runtime dependencies or external resources.
- Uses only Chrome extension APIs and browser-native print handling.
