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

Intelligent practice SHALL load the entire selected pool, including future-due kana, and sample randomly with positive weights influenced by FSRS difficulty, recall probability calculated by the installed ts-fsrs implementation, due status, and the latest session answer. Incorrect/revealed answers SHALL increase subsequent frequency; correct answers SHALL remove the temporary mistake boost. Successful commits SHALL update sampling state before the next prompt. Sessions SHALL continue until the learner finishes. Free practice and its mistake drills SHALL remain transient and SHALL NOT read or update FSRS.

#### Scenario: Mixed selection

- **WHEN** selected kana include overdue, unseen and future-due cards
- **THEN** all remain eligible and difficult or neglected cards have greater sampling weight under otherwise equal conditions
- **AND** no fixed due or catalog order controls presentation

#### Scenario: No due cards

- **WHEN** every selected kana has a future due date
- **THEN** the learner can still begin and continue intelligent practice

#### Scenario: Practice outside the schedule

- **WHEN** a learner answers a selected card before its due date in intelligent practice
- **THEN** new or due reviews and confirmed failures are persisted exactly once with FSRS
- **AND** early correct answers count in the transient session without another FSRS log or increased stability
- **AND** free practice still leaves scheduled progress unchanged

### Requirement: Each scheduled answer is committed once with visible status

The UI SHALL commit an eligible scheduled answer immediately on grading, including an automatic correct input match, show saving status, prevent duplicate grading and advancement while saving, and offer retry after a failure using the same review identity and time. Successful saves SHALL allow automatic advancement of correct answers after brief feedback and enable Next and Finish practice and keyboard continuation after incorrect answers have revealed their reading. Showing a confirmed error's reading SHALL NOT create another commit or change its rating. Enter on a save error SHALL retry the original request. Text entered during correct feedback SHALL survive a pending or failed save and carry into the next card only after persistence succeeds. Feedback and errors SHALL be accessible and localized. Finish practice SHALL be disabled during pending or failed saves. Successful saves SHALL permit another prompt even before its due date. Early successful answers SHALL count in session scores without a persistence write, display practice-only feedback and permit continuation and finish. The app SHALL retain existing retention/fuzz settings and Good/Again grading; typing speed SHALL NOT determine the grade. An explicit finish SHALL show session results and an action returning to selection.

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

### Requirement: Immediate successful practice does not inflate FSRS

Before committing an intelligent-practice answer, the app SHALL update FSRS for new cards, cards due at the answer instant, or an Again rating. Other correct answers SHALL only update the transient session and SHALL NOT add a durable FSRS event, change stability or move the due date. Sampling SHALL still respond to the latest session answer. Free practice SHALL remain isolated from FSRS in all cases.

#### Scenario: Repeat a character twenty times immediately

- **WHEN** a new character is answered correctly twenty times before its next due time
- **THEN** all twenty answers appear in session results while FSRS has only the initial review
- **AND** a subsequent confirmed error updates FSRS once with Again

#### Scenario: Cross the due boundary during practice

- **WHEN** a character becomes due during an active session
- **THEN** its next correct answer updates FSRS normally

### Requirement: Local progress reset is complete and recoverable

Reset SHALL delete all catalog kana's FSRS states and review logs, including malformed records, without clearing unrelated application data. It SHALL serialize with normal review operations. A durable reset intent SHALL precede deletion and remain until deletion completes. Following an interruption, subsequent progress reads/writes SHALL complete the pending reset or surface an error rather than silently load partially reset progress. Repeated resets SHALL be safe. Dashboard and Progress SHALL reflect zero saved reviews and all kana unseen on their next focus/refresh; subsequent practice SHALL create fresh progress.

#### Scenario: Start again

- **WHEN** a learner resets progress for both alphabets and returns to Progress
- **THEN** studied and saved-review counts are zero and later answers create fresh history

#### Scenario: Interrupted deletion

- **WHEN** a reset fails after removing only some keys or before clearing its intent
- **THEN** it does not report success and a retry or reopened storage completes deletion before permitting progress operations

#### Scenario: Ordered writes

- **WHEN** a review commit is queued before reset and another after it
- **THEN** the earlier review is removed and only the later new review remains
