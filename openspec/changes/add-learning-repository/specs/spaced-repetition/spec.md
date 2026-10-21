## MODIFIED Requirements

### Requirement: Local progress and complete logs survive reopening

The app SHALL persist per-card versioned progress and complete FSRS logs including review identities inside a transactionally stored account document. It SHALL validate stored shapes, identities, numeric ranges, states, ratings, and dates. It SHALL serialize commits, preserve state, logs, event and pending queue in one atomic transaction, and apply a review identity at most once. Unsupported/corrupt records SHALL produce a recoverable error without being overwritten. Missing records SHALL initialize as unseen. Selection changes SHALL NOT delete history.

#### Scenario: Resume scheduled study

- **WHEN** the app reopens after a successful review save
- **THEN** the saved state and complete log are restored and the kana is selected according to its due time

#### Scenario: Duplicate or retried write

- **WHEN** the same review identity is submitted twice, including after an uncertain save
- **THEN** reps and log length increase only once

#### Scenario: Storage is unavailable or corrupt

- **WHEN** loading or saving scheduled progress fails
- **THEN** the UI reports the error and offers retry, does not claim persistence succeeded, and does not replace existing data with default progress

### Requirement: Local progress reset is complete and recoverable

Reset SHALL clear the active guest’s FSRS states, review logs and pending reviews in one local transaction, preserving selection and preferences. Explicit guest reset SHALL support malformed review data when the document and settings remain readable. Account reset SHALL persist a durable request identity and atomically clear canonical progress through authenticated synchronization. A reset generation SHALL prevent stale devices from restoring deleted events. Pending account resets SHALL resume after interruption and block study until acknowledged. Repeated requests with the same identity SHALL NOT clear newer progress.

#### Scenario: Start again

- **WHEN** a learner resets progress for both alphabets and returns to Progress
- **THEN** studied and saved-review counts are zero and later answers create fresh history

#### Scenario: Interrupted deletion

- **WHEN** an account reset fails or its response is lost
- **THEN** it does not report success and a retry or reopened synchronization acknowledges that same reset before permitting progress operations

#### Scenario: Ordered writes

- **WHEN** a guest review commit is queued before reset and another after it
- **THEN** the earlier review is removed and only the later new review remains
