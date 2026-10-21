# spaced-repetition Specification

## Purpose

Define device-local FSRS scheduling, durable review history, due-card study, and failure-safe persistence alongside transient free practice.

## Requirements

### Requirement: Scheduling uses official FSRS state and ratings

The app SHALL initialize unseen kana through createEmptyCard and schedule using the pinned official ts-fsrs library. State SHALL include due, stability, difficulty, elapsed_days, scheduled_days, learning_steps, reps, lapses, state, and optional last_review. The service SHALL accept Again, Hard, Good, and Easy; the typed-answer UI SHALL map correct to Good and incorrect/reveal to Again. Blank answers SHALL NOT produce reviews. The scheduler SHALL use explicit review times, default weights, 90% retention, and disabled fuzz.

#### Scenario: Learn and forget a kana

- **WHEN** a learner correctly reviews an unseen kana and later forgets it after graduation
- **THEN** the library advances the card through learning/review and relearning, updates counts, and returns a complete log for each accepted review

#### Scenario: Binary answers

- **WHEN** a learner submits a correct answer, a wrong answer, reveals an answer, or submits whitespace
- **THEN** their scheduled outcomes are respectively Good, Again, Again, and no review

### Requirement: Local progress and complete logs survive reopening

The app SHALL persist per-card versioned progress and complete FSRS logs including review identities under namespaced keys. It SHALL validate stored shapes, identities, numeric ranges, states, ratings, and dates. It SHALL serialize commits, preserve state and log in one per-card write, and apply a review identity at most once. Unsupported/corrupt records SHALL produce a recoverable error without being overwritten. Missing records SHALL initialize as unseen. Selection changes SHALL NOT delete history.

#### Scenario: Resume scheduled study

- **WHEN** the app reopens after a successful review save
- **THEN** the saved state and complete log are restored and the kana is selected according to its due time

#### Scenario: Duplicate or retried write

- **WHEN** the same review identity is submitted twice, including after an uncertain save
- **THEN** reps and log length increase only once

#### Scenario: Storage is unavailable or corrupt

- **WHEN** loading or saving scheduled progress fails
- **THEN** the UI reports the error and offers retry, does not claim persistence succeeded, and does not replace existing data with default progress

### Requirement: Review times are absolute instants

The app SHALL serialize all FSRS dates as UTC ISO strings, hydrate them to Date values for scheduling, compare due times in epoch milliseconds, and format dates in the learner's locale for display only. It SHALL reject invalid review times and times earlier than last_review.

#### Scenario: Timezone and DST changes

- **WHEN** the device timezone changes across a daylight-saving boundary
- **THEN** the stored due instant and last-review instant remain unchanged and eligibility depends on the current instant

### Requirement: Scheduled review is distinct from free practice

Selection SHALL expose scheduled review in addition to free practice. Scheduled review SHALL load selected families' progress, present overdue cards in due order followed by unseen cards, and omit future-due cards. Rounds SHALL be finite, showing each queued card once. Starting another scheduled round SHALL reload eligibility. Free practice, repeats, and immediate mistake drills SHALL NOT update FSRS state. Scheduled progress SHALL survive leaving while round scores remain transient.

#### Scenario: Mixed due queue

- **WHEN** selected families contain overdue, unseen, and future-due kana
- **THEN** scheduled study presents overdue kana first, then unseen kana, and excludes future-due kana

#### Scenario: Nothing is due

- **WHEN** all selected kana have future due dates
- **THEN** the learner sees a nothing-due message, the next due time, a refresh action, and a way back to selection

#### Scenario: Practice outside the schedule

- **WHEN** the learner repeats a free-practice selection or drills mistakes
- **THEN** scores work as before and scheduled progress is unchanged

### Requirement: Each scheduled answer is committed once with visible status

The UI SHALL commit a valid scheduled answer immediately on grading, including an automatic correct input match, show saving status, prevent duplicate grading and advancement while saving, and offer retry after a failure using the same review identity and time. Successful saves SHALL allow automatic advancement of correct answers after brief feedback and enable Next or results and keyboard continuation after incorrect answers have revealed their reading. Showing a confirmed error's reading SHALL NOT create another commit or change its rating. Enter on a save error SHALL retry the original request. Text entered during correct feedback SHALL survive a pending or failed save and carry into the next card only after persistence succeeds. Feedback and errors SHALL be accessible and localized. Completed scheduled rounds SHALL return to selection rather than automatically rehearse cards before their due time.

#### Scenario: Submit twice while saving

- **WHEN** keyboard submission and a button press arrive for the same card
- **THEN** only one grade and review commit are created and advancement remains blocked until persistence succeeds

#### Scenario: Retry a failed save

- **WHEN** a save fails and the learner activates Retry or presses Enter
- **THEN** the original answer and timestamp are retried and the learner can advance after success

#### Scenario: Slow correct save with early typing

- **WHEN** a correct answer is saving and the learner types more text
- **THEN** the current card remains until the save succeeds
- **AND** the new text is retained and checked against the following card only after the previous save succeeds, producing a separate commit if it matches

### Requirement: Scheduling is covered by Jest and native interaction tests

The project SHALL use Jest with jest-expo and React Native Testing Library. Unit tests SHALL cover all four ratings, interval progression, state transitions, queue selection, UTC serialization, validation, and storage retries. Component tests SHALL cover submit/reveal, blanks, duplicate actions, saving/errors, and free-practice isolation.

#### Scenario: Run automated verification

- **WHEN** pnpm test runs
- **THEN** scheduler, persistence, existing domain checks, and native component interaction tests execute through Jest
