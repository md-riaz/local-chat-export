# Spec Delta

## Purpose

Create a clean, paginated document that a user can save as PDF through the browser's native print workflow.

## ADDED Requirements

### Requirement: Native print PDF workflow
The extension SHALL open a local extension print document and invoke the browser print workflow only after the user starts an export.

#### Scenario: User exports a conversation
- **WHEN** the user confirms export settings
- **THEN** a local print document opens with the captured conversation and native print is requested

### Requirement: Print-safe pagination
The print document SHALL apply print rules that avoid splitting individual message cards, code blocks, table rows, and images when the browser can keep them together.

#### Scenario: Long conversation prints
- **WHEN** the print document spans multiple pages
- **THEN** it uses the selected page geometry and protects eligible blocks from avoidable page breaks

### Requirement: Readable local rendering
The print document SHALL provide light and dark export themes and shall not require a network resource to render text, code, or layout.

#### Scenario: Offline print preview
- **WHEN** the extension is offline after conversation capture
- **THEN** the print document remains readable and ready for native PDF saving
