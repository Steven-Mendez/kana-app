## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Immediate successful practice does not inflate FSRS

Before committing an intelligent-practice answer, the app SHALL update FSRS for new cards, cards due at the answer instant, or an Again rating. Other correct answers SHALL only update the transient session and SHALL NOT add a durable FSRS event, change stability or move the due date. Sampling SHALL still respond to the latest session answer. Free practice SHALL remain isolated from FSRS in all cases.

#### Scenario: Repeat a character twenty times immediately

- **WHEN** a new character is answered correctly twenty times before its next due time
- **THEN** all twenty answers appear in session results while FSRS has only the initial review
- **AND** a subsequent confirmed error updates FSRS once with Again

#### Scenario: Cross the due boundary during practice

- **WHEN** a character becomes due during an active session
- **THEN** its next correct answer updates FSRS normally
