# Design

## Context

The project is a new Manifest V3 extension. See `proposal.md` for motivation. The extension must remain local-only, so it cannot rely on a PDF service or a third-party rendering library fetched at runtime.

## Goals / Non-Goals

**Goals:**
- Extract the visible conversation from the active supported ChatGPT tab.
- Build an inert, self-contained print document in an extension tab.
- Preserve useful rich markup while removing executable or network-triggering content.
- Use the browser's PDF renderer for selectable text and reliable typography.

**Non-Goals:**
- Copy ChatGPT branding, assets, or proprietary UI exactly.
- Circumvent ChatGPT access controls or fetch conversations not visible to the user.
- Implement silent printing or direct PDF downloading, which Chrome restricts.
- Guarantee pixel-identical rendering across every ChatGPT deployment or browser.

## Decisions

### Manifest V3 content script plus extension print page
The content script captures only DOM already visible in the active ChatGPT tab, then opens a `chrome-extension://` print page and transfers a sanitized snapshot through extension messaging. This keeps capture scoped to user-visible content and avoids a server.

Alternative: access ChatGPT internal APIs. Rejected because it expands permissions and creates token/security risk without helping the local print use case.

### Native print instead of canvas or JavaScript PDF generation
The print page invokes `window.print()` after rendering. Chrome's renderer keeps text selectable and handles fonts, tables, and page geometry better than a canvas snapshot.

Alternative: canvas or jsPDF. Rejected because large chats become blurry or memory-heavy and page break control degrades.

### Sanitized clone with controlled stylesheet
The capture code clones message HTML then removes scripts, styles, event attributes, iframes, forms, and unsafe URLs. The print page supplies its own clean-room stylesheet plus CSS custom properties selected by the dialog.

Alternative: copy every computed style. Rejected because it creates a huge fragile snapshot and can import external resource dependencies.

### Session storage handoff
The content script stores the one-time export payload in `chrome.storage.session` under a random identifier passed to the print page. The print page removes it after reading. This avoids URL-sized payloads and keeps conversation HTML out of browser history.

## Risks / Trade-offs

- [ChatGPT DOM changes] → Use role and article selectors with a visible fallback, show a clear no-message error, and keep selectors isolated for updates.
- [Some rich content relies on site CSS] → Preserve semantic markup and add robust export CSS; rendered math and images remain best-effort.
- [Native print opens a dialog] → This is an intentional Chrome privacy/security constraint and produces the highest-quality local PDF.
- [Very large conversations] → Capture only selected conversation DOM, avoid rasterizing, and yield before opening the print page.

## Migration Plan

A new installation has no migration. To roll back, disable or remove the unpacked extension; it stores no account or remote state.
