# Spec Delta

## Purpose

Provide an accessible local interface for initiating exports and choosing document presentation settings.

## ADDED Requirements

### Requirement: Accessible export trigger
The extension SHALL show an accessible export control on supported ChatGPT pages and support keyboard activation.

#### Scenario: User activates exporter
- **WHEN** the user clicks the export control or presses Enter or Space while it is focused
- **THEN** the extension presents export settings

### Requirement: Local presentation settings
The extension SHALL let the user choose export theme, paper size, margins, title, and whether to begin each prompt-response pair on a new page.

#### Scenario: User changes settings
- **WHEN** the user modifies presentation settings and starts export
- **THEN** the local print document reflects the selected settings
