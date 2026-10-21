# app-preferences Specification

## Purpose

Define locally persisted appearance and language preferences, localized study screens, and selection reset with resilient storage behavior.

## Requirements

### Requirement: Appearance and language preferences persist locally

Settings SHALL provide light/dark appearance and Spanish/English language choices, defaulting to light and Spanish. Changes SHALL apply immediately throughout the app and persist locally, independently of kana selection. Restoration SHALL precede editing; unknown or malformed stored values SHALL fall back safely without overwriting storage during hydration. Writes SHALL be ordered; storage failures SHALL leave the app usable with a localized notice and allow subsequent writes to recover.

#### Scenario: Restore preferences

- **WHEN** the learner chooses dark and English and restarts or reloads
- **THEN** both preferences are restored before settings are editable
- **AND** kana selection is preserved

#### Scenario: Storage is unavailable

- **WHEN** reading or saving preferences fails
- **THEN** the app remains usable and presents a nonblocking notice
- **AND** subsequent preference changes can be saved when storage recovers

### Requirement: Themes and language cover the complete study experience

Navigation, Profile, Settings, selection, study, results, storage notices, and accessibility copy SHALL use the chosen language. Kana and accepted rōmaji SHALL remain unchanged. Every screen SHALL use semantic light/dark tokens, with readable feedback, focus and selection indicators, matching status-bar appearance, and at least 44px controls. At 320px and with enlarged text, content SHALL remain readable and scrollable without horizontal overflow.

#### Scenario: Switch during normal use

- **WHEN** the learner changes language and appearance and returns to Practice
- **THEN** selection, a new study round, feedback, and results use the chosen language and palette
- **AND** correctness rules and selected families remain unchanged

### Requirement: Settings can restore the default selection

Settings SHALL explain which data is local and transient and provide an explicit selection reset action. Reset SHALL restore only the initial Hiragana vowel family and visible alphabet, leaving appearance and language unchanged. Completion SHALL be acknowledged, including any storage failure.

#### Scenario: Reset the practice selection

- **WHEN** the learner activates Reset selection
- **THEN** Practice shows only the five Hiragana vowels selected
- **AND** the chosen appearance and language remain active

### Requirement: Settings can reset all local study progress

Settings SHALL provide a separate action to reset all study progress on this device. It SHALL explain that both alphabets' review history and scheduling are deleted, the operation cannot be undone, and selection, language and theme remain unchanged. Opening the action SHALL display explicit confirm and cancel controls without deleting anything. Duplicate confirmation SHALL be blocked while deleting. Completion SHALL be shown only after successful deletion; errors SHALL offer retry without claiming success. All copy and accessibility labels SHALL support Spanish and English.

#### Scenario: Cancel deletion

- **WHEN** the learner opens the reset confirmation and cancels
- **THEN** no progress is changed

#### Scenario: Confirm deletion

- **WHEN** the learner explicitly confirms reset
- **THEN** both alphabets' saved history is cleared and a success message appears after completion
- **AND** selection, language and theme remain unchanged
