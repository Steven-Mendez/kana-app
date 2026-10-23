## ADDED Requirements

### Requirement: Mastery levels come from answers

Each kana SHALL have a mastery level from 0 to 100% derived only from its saved answers in time order. A correct answer SHALL add 5 points, limited so that the level gains at most 20 points per kana per local calendar day; a mistake SHALL subtract 10 points without going below 0, and SHALL NOT restore that day's allowance. A kana at 100% SHALL be mastered. An unmastered kana with answers SHALL become due at the next local midnight after its last answer; a mastered kana SHALL become due 14 days after its last answer. Saved answers SHALL use rating 3 for correct and 1 for a mistake; history saved before this change SHALL count rating 1 as a mistake and ratings 2–4 as correct. Viewing progress SHALL NOT change levels.

#### Scenario: Drill within one day

- **WHEN** a learner answers a new kana correctly ten times on the same day
- **THEN** its level is 20% and it is not mastered
- **AND** the next correct answer on the following day raises it to 25%

#### Scenario: Master over several days

- **WHEN** a learner answers a kana correctly at least four times on each of five different days without mistakes
- **THEN** its level is 100%, it is mastered and its next review is 14 days after the last answer

#### Scenario: Mistake on a mastered kana

- **WHEN** a mastered kana is answered wrongly
- **THEN** its level drops to 90%, it is no longer mastered and it is due on the next local day

#### Scenario: Existing history

- **WHEN** a learner has answers saved by the previous scheduler
- **THEN** their levels are recomputed from those answers without losing history

## MODIFIED Requirements

### Requirement: Local progress and complete logs survive reopening

The app SHALL persist every saved answer as an event with its identity, kana, rating, time and device, and SHALL derive versioned per-kana progress (mastery level, answer counts, today's gain, last answer, due time and the answer log) from those events. It SHALL validate stored shapes, identities, numeric ranges, ratings and dates. It SHALL serialize commits, keep events and derived progress consistent in one write, and apply an answer identity at most once. Progress stored in an older version SHALL be rebuilt from its events. Unsupported/corrupt records SHALL produce a recoverable error without being overwritten. Missing records SHALL initialize as unseen. Selection changes SHALL NOT delete history.

#### Scenario: Resume study

- **WHEN** the app reopens after a successful save
- **THEN** the saved level and complete answer log are restored

#### Scenario: Duplicate or retried write

- **WHEN** the same answer identity is submitted twice, including after an uncertain save
- **THEN** the answer count and level change only once

#### Scenario: Storage is unavailable or corrupt

- **WHEN** loading or saving progress fails
- **THEN** the UI reports the error and offers retry, does not claim persistence succeeded, and does not replace existing data with default progress

### Requirement: Review times are absolute instants

The app SHALL serialize answer and due times as UTC ISO strings, compare due times in epoch milliseconds, and format dates in the learner's locale for display only. Daily allowances and next-day due times SHALL use the device's local calendar day when progress is derived. It SHALL reject invalid answer times and times earlier than the kana's last answer.

#### Scenario: Timezone and DST changes

- **WHEN** the device timezone changes across a daylight-saving boundary
- **THEN** stored answer instants remain unchanged and eligibility depends on the current instant

### Requirement: Scheduled review is distinct from free practice

Smart review SHALL load the entire selected pool and sample randomly with positive weights: unseen kana SHALL weigh 3; studied kana SHALL weigh more the lower their level and when due; kana that already gained today's maximum without being mastered SHALL weigh half; the latest session mistake SHALL triple a kana's weight and the previous prompt SHALL weigh half. Successful commits SHALL update sampling state before the next prompt. Sessions SHALL continue until the learner finishes or a finite round ends. Smart review SHALL always be startable with a non-empty selection. A due-only round SHALL use the due kana snapshot and, when none remain, SHALL report that and the next due time. Free rounds (duels) and their mistake drills SHALL remain transient and SHALL NOT read or update progress.

#### Scenario: Mixed selection

- **WHEN** selected kana include unseen, low-level, mastered and capped kana
- **THEN** all remain eligible and unseen or low-level kana appear more often than mastered or capped ones under otherwise equal conditions

#### Scenario: Practice beyond today's cap

- **WHEN** a learner keeps answering a kana correctly after it gained 20 points today
- **THEN** each answer is saved and counted in the session while its level stays the same until the next day

### Requirement: Each scheduled answer is committed once with visible status

The UI SHALL commit every graded Smart review answer immediately, including an automatic correct input match, show saving status, prevent duplicate grading and advancement while saving, and offer retry after a failure using the same answer identity and time. Successful saves SHALL show the kana's new mastery level, noting when today's maximum is reached, and SHALL allow automatic advancement of correct answers after brief feedback and enable Next and Finish practice and keyboard continuation after incorrect answers have revealed their reading. Showing a confirmed error's reading SHALL NOT create another commit or change its rating. Enter on a save error SHALL retry the original request. Text entered during correct feedback SHALL survive a pending or failed save and carry into the next card only after persistence succeeds. Feedback and errors SHALL be accessible and localized. Finish practice SHALL be disabled during pending or failed saves. Typing speed SHALL NOT determine the grade. An explicit finish SHALL show session results and an action returning to selection.

#### Scenario: Submit twice while saving

- **WHEN** keyboard submission and a button press arrive for the same card
- **THEN** only one grade and commit are created and advancement remains blocked until persistence succeeds

#### Scenario: Retry a failed save

- **WHEN** a save fails and the learner activates Retry or presses Enter
- **THEN** the original answer and timestamp are retried and the learner can advance after success

#### Scenario: See the level rise

- **WHEN** a correct answer for い at 40% is saved
- **THEN** the status line reports い at 45%

### Requirement: Scheduling is covered by Jest and native interaction tests

The project SHALL use Jest with jest-expo and React Native Testing Library. Unit tests SHALL cover mastery gains, the daily allowance, mistakes, due times, legacy ratings, queue selection, sampling weights, UTC serialization, validation and storage retries. Component tests SHALL cover submit/reveal, blanks, duplicate actions, saving/errors, level feedback and free-round isolation.

#### Scenario: Run automated verification

- **WHEN** pnpm test runs
- **THEN** mastery, persistence, existing domain checks, and native component interaction tests execute through Jest

### Requirement: Local progress reset is complete and recoverable

Reset SHALL delete all catalog kana's answers and derived progress, including malformed records, without clearing unrelated application data. It SHALL serialize with normal answer commits. A durable reset intent SHALL precede deletion and remain until deletion completes. Following an interruption, subsequent progress reads/writes SHALL complete the pending reset or surface an error rather than silently load partially reset progress. Repeated resets SHALL be safe. Home and Profile SHALL reflect zero saved answers and all kana unseen on their next focus/refresh; subsequent practice SHALL create fresh progress.

#### Scenario: Start again

- **WHEN** a learner resets progress for both alphabets and returns to Profile
- **THEN** studied and saved-answer counts are zero and later answers create fresh history

#### Scenario: Interrupted deletion

- **WHEN** a reset fails after removing only some keys or before clearing its intent
- **THEN** it does not report success and a retry or reopened storage completes deletion before permitting progress operations

#### Scenario: Ordered writes

- **WHEN** an answer commit is queued before reset and another after it
- **THEN** the earlier answer is removed and only the later new answer remains

## REMOVED Requirements

### Requirement: Scheduling uses official FSRS state and ratings

**Reason**: FSRS is replaced by the mastery level, which suits a small set learned within about two weeks.
**Migration**: Saved FSRS events are replayed as answers; Again counts as a mistake, other ratings as correct.

### Requirement: Immediate successful practice does not inflate FSRS

**Reason**: Every Smart review answer now counts; the daily allowance limits gains from drilling instead.
**Migration**: None; answers that were not saved before were never stored.
