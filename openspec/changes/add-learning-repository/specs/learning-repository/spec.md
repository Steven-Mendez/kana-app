## ADDED Requirements

### Requirement: Local commits are atomic

The repository SHALL persist each scheduled review and its pending event in one transaction, namespace all data by account, and retain legacy records after validated migration.

#### Scenario: The app closes after a review is saved

- **WHEN** the app closes after a review is saved
- **THEN** The review and pending operation both survive reopening.

### Requirement: Guest import requires a choice

The app SHALL ask before importing guest data, preserve declined guest data, deduplicate repeated imports, and inherit settings only when the remote account has no settings.

#### Scenario: An import is retried after interruption

- **WHEN** an import is retried after interruption
- **THEN** Every event appears once and existing account preferences remain authoritative.

### Requirement: Migration and account switching preserve data

SQLite on native and IndexedDB on web SHALL serialize writes atomically. A versioned guest migration SHALL validate old preferences, selection and complete review logs, retain the original AsyncStorage records, and safely resume after interruption. An unreadable document SHALL remain untouched with a recoverable error. Signing out SHALL hide the account workspace and retain its pending operations for that account only.

#### Scenario: An original record is corrupt

- **WHEN** migration cannot validate a legacy record
- **THEN** no empty replacement is written and retry can resume after the data is recovered

#### Scenario: A guest declines import

- **WHEN** the learner chooses to continue with the account
- **THEN** guest events remain separately available and are not queued for that account

#### Scenario: Another account signs in

- **WHEN** a learner signs out with pending operations and a different account signs in
- **THEN** the second account neither displays nor sends the first account's pending data

### Requirement: Continuous practice survives the storage migration

The new repository SHALL preserve continuous adaptive practice from origin: early failures can create FSRS events, early correct drills remain transient, and each event is queued exactly once. Migration SHALL honor a legacy reset intent instead of resurrecting partially deleted review history.

#### Scenario: Fail before the next due time

- **WHEN** an already reviewed kana is answered incorrectly before it is due
- **THEN** its Again event and pending synchronization entry are persisted atomically

#### Scenario: Migrate an interrupted legacy reset

- **WHEN** the legacy reset marker exists during initial migration
- **THEN** no old review event is imported and preferences and kana selection are preserved

### Requirement: Reset uses the active transactional repository

Confirmed guest reset SHALL atomically clear only guest events, logs and pending reviews while preserving selection and preferences. Account reset SHALL persist its request identity, use authenticated server reset and clear local obsolete progress only when the server generation is known. A failed reset SHALL remain retryable and SHALL NOT claim success.

#### Scenario: Reset a guest with other accounts stored

- **WHEN** the guest confirms reset
- **THEN** both alphabets become unseen and other account documents remain unchanged
