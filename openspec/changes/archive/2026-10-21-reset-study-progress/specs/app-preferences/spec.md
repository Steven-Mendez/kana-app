## ADDED Requirements

### Requirement: Settings can reset all local study progress

Settings SHALL provide a separate action to reset all study progress on this device. It SHALL explain that both alphabets' review history and scheduling are deleted, the operation cannot be undone, and selection, language and theme remain unchanged. Opening the action SHALL display explicit confirm and cancel controls without deleting anything. Duplicate confirmation SHALL be blocked while deleting. Completion SHALL be shown only after successful deletion; errors SHALL offer retry without claiming success. All copy and accessibility labels SHALL support Spanish and English.

#### Scenario: Cancel deletion

- **WHEN** the learner opens the reset confirmation and cancels
- **THEN** no progress is changed

#### Scenario: Confirm deletion

- **WHEN** the learner explicitly confirms reset
- **THEN** both alphabets' saved history is cleared and a success message appears after completion
- **AND** selection, language and theme remain unchanged
