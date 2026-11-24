# Tasks

## 1. Extension foundation

- [x] 1.1 Create the Manifest V3 extension structure with restricted ChatGPT match patterns and verify `node --test test/manifest.test.mjs` passes.
- [x] 1.2 Add static, local-only assets and document developer loading and print behavior in `README.md`; verify the documented unpacked-extension path exists.

## 2. Capture and sanitization

- [x] 2.1 Implement visible-message discovery, title extraction, and safe rich-content sanitization; verify `node --test test/capture.test.mjs` covers ordinary, empty, and unsafe markup fixtures.
- [x] 2.2 Implement one-time session payload handoff to the extension print page; verify `node --test test/payload.test.mjs` passes.

## 3. Export experience

- [x] 3.1 Implement accessible in-page export controls and local presentation settings; verify `node --test test/dialog.test.mjs` covers activation and setting serialization.
- [x] 3.2 Implement the print document renderer and print stylesheet for themes, typography, and protected page breaks; verify `node --test test/print.test.mjs` checks generated document state and critical CSS rules.

## 4. Integration verification

- [x] 4.1 Run the complete unit test suite and static local-only scan; verify `npm test` and `npm run verify:local` pass.
- [x] 4.2 Validate the OpenSpec change with `npx openspec validate add-local-chatgpt-pdf-exporter --strict` and verify every completed task checkbox is accurate.

## Workflow follow-up

- Archive the change after project review requirements are satisfied.
