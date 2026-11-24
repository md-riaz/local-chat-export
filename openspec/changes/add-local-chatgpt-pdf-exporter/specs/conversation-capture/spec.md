# Spec Delta

## Purpose

Capture a user-visible ChatGPT conversation into a self-contained export document while preserving its readable semantic content.

## ADDED Requirements

### Requirement: Capture visible conversation content
The extension SHALL capture the title and visible user and assistant messages from the active supported ChatGPT conversation without reading unrelated browser tabs.

#### Scenario: Conversation page is detected
- **WHEN** a supported ChatGPT conversation has visible message articles
- **THEN** the export document contains those messages in their displayed order

#### Scenario: No conversation is available
- **WHEN** the user invokes export on a supported page with no visible conversation messages
- **THEN** the extension shows a local error and does not open a print document

### Requirement: Preserve safe rich content
The export document SHALL retain safe conversation markup including text, lists, blockquotes, code, tables, links, images, and existing rendered mathematics while excluding active scripts and event handlers.

#### Scenario: Rich message is exported
- **WHEN** a visible message contains supported rich content
- **THEN** the print document presents that content as inert readable HTML
