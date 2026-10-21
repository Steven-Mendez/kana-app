## MODIFIED Requirements

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
