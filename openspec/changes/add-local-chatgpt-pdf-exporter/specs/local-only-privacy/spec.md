# Spec Delta

## Purpose

Ensure the extension processes a user's visible conversation entirely inside the browser without service, account, tracking, or quota dependencies.

## ADDED Requirements

### Requirement: No remote export dependency
The extension SHALL not send conversation content, export settings, identifiers, or usage data to any remote endpoint.

#### Scenario: Export is completed
- **WHEN** a user captures and prints a conversation
- **THEN** the extension completes the workflow without a remote export request

### Requirement: No account or quota gate
The extension SHALL not require sign-in, payment, a license, analytics consent, or an export quota for its local workflow.

#### Scenario: New installation exports
- **WHEN** a user exports after a new installation
- **THEN** the export can start without creating or using an account
