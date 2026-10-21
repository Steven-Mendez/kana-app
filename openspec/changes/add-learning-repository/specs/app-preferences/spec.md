## MODIFIED Requirements

### Requirement: Appearance and language preferences persist locally

Settings SHALL provide light/dark appearance and Spanish/English language choices, defaulting to light and Spanish. Changes SHALL apply immediately throughout the app and persist locally, independently of kana selection. Restoration SHALL precede editing; malformed stored values SHALL show a recoverable error without overwriting the original account document. Writes SHALL be ordered; write failures SHALL leave the loaded app usable with a localized notice and allow subsequent writes to recover. Failed initial restoration SHALL block editing until a successful retry prevents data loss.

#### Scenario: Restore preferences

- **WHEN** the learner chooses dark and English and restarts or reloads
- **THEN** both preferences are restored before settings are editable
- **AND** kana selection is preserved

#### Scenario: Storage is unavailable

- **WHEN** reading or saving preferences fails
- **THEN** failed saves present a nonblocking notice; failed initial restoration presents a recovery screen
- **AND** subsequent preference changes can be saved when storage recovers

### Requirement: Settings can reset all local study progress

Settings SHALL provide a separate action to reset all study progress for the active learner. Guest reset SHALL affect only this device; account reset SHALL explain that confirmed history is removed from the account and all devices when they synchronize. Other accounts SHALL remain untouched. It SHALL explain that both alphabets' review history and scheduling are deleted, the operation cannot be undone, and selection, language and theme remain unchanged. Opening the action SHALL display explicit confirm and cancel controls without deleting anything. Duplicate confirmation SHALL be blocked while deleting. Completion SHALL be shown only after successful deletion; errors SHALL offer retry without claiming success. All copy and accessibility labels SHALL support Spanish and English.

#### Scenario: Cancel deletion

- **WHEN** the learner opens the reset confirmation and cancels
- **THEN** no progress is changed

#### Scenario: Confirm deletion

- **WHEN** the learner explicitly confirms reset
- **THEN** both alphabets' saved history is cleared and a success message appears after completion
- **AND** selection, language and theme remain unchanged
