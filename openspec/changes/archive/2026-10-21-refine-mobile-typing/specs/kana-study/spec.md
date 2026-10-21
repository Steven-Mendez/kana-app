## MODIFIED Requirements

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL present an alphabet selector with per-alphabet counts, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Each family SHALL be one selectable row containing aligned kana/rōmaji previews and an explicit check indicator. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a scheduled/free practice mode selector, and one Start study button SHALL occupy a compact bottom action area that does not cover the table. Scheduled review SHALL be the default mode; the selected mode SHALL be explicit and its purpose briefly explained. A zero-card selection SHALL disable Start study. On wide screens selection SHALL remain centered and no wider than 896 logical pixels; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize a large central kana prompt with a subordinate alphabet label. A compact header SHALL contain an accessible Change selection close action, answered/total progress, correct count, and a thin progress indicator. The underlined rōmaji input, feedback, and current action SHALL form a bottom answer area reachable with the software keyboard. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise summary, actual round score, best consecutive-correct streak for this round, and a plain mistakes list with submitted-answer corrections. A compact current consecutive-correct count MAY appear alongside answered/total progress during typing. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

The study input SHALL be no wider than 192 logical pixels. Answer actions SHALL remain compact; an icon-only Check action SHALL expose the same accessible label as the text action. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana SHALL dominate the composition. The transient-round explanation SHALL remain a short footer sentence. Content SHALL scroll when screen height or enlarged text requires it.

The study surface SHALL NOT add guided-path navigation, lesson locks, daily or historical streaks, countdown timers, mastery indicators, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. Global navigation SHALL remain hidden during study and results.

#### Scenario: Minimal selection on a phone

- **WHEN** the learner opens selection at a 390-logical-pixel width
- **THEN** alphabet and category controls are clear and each family is a whole-row control with readable kana/rōmaji pairs
- **AND** the compact start area stays above the tab bar and safe-area inset without obscuring the final family
- **AND** guided-path, mastery, and historical-statistics controls are absent

#### Scenario: Select across categories and alphabets

- **WHEN** a learner selects a basic family, a voiced family, and a family from the other alphabet
- **THEN** changing the visible category or alphabet preserves all three selections and their combined count
- **AND** Select all and Clear affect the whole visible alphabet rather than only the visible category

#### Scenario: Choose a study mode

- **WHEN** the learner chooses Free practice and activates Start study
- **THEN** a transient free-practice round starts with the selected families
- **AND** choosing Scheduled review instead starts the existing due-card flow

#### Scenario: Focused study on a wide screen

- **WHEN** study is shown on a desktop-width viewport
- **THEN** the prompt, input, feedback, and answer actions form a centered column no wider than 512 logical pixels
- **AND** the kana has stronger visual emphasis than the progress and correct-count labels

#### Scenario: Answer on a phone

- **WHEN** the software keyboard opens
- **THEN** the input and answer action remain reachable, the prompt stays readable, and explicit submission still grades only once
- **AND** feedback and Next/results stay reachable after grading

#### Scenario: Simplified results

- **WHEN** a free-practice round finishes with mistakes
- **THEN** accuracy and correct/incorrect totals appear above a plain mistakes list
- **AND** Review mistakes is the only filled primary action, with Repeat selection and Change selection secondary

## ADDED Requirements

### Requirement: Mobile typing feedback is stable and explicit

The typing prompt SHALL remain cardless and use the existing semantic color system. Correct grades SHALL color the kana and input underline with success; incorrect or revealed grades SHALL use error, accompanied by textual feedback. Input and feedback SHALL remain in a centered column. At normal text sizes, grading SHALL NOT horizontally move the input or move the prompt merely because feedback appears: the submit footprint and two feedback lines SHALL be reserved. Long answers and enlarged text MAY grow the feedback region with scroll access rather than truncating the answer.

The existing input SHALL remain mounted and focused across prompt changes. Correct matches SHALL continue to advance automatically; wrong drafts SHALL remain editable until submitted, and confirmed mistakes SHALL retain the show-reading acknowledgement step. Scheduled reviews SHALL retain exactly-once commits and failure/retry gating.

#### Scenario: Type continuously with the keyboard open

- **WHEN** a learner types consecutive correct readings on a portrait phone
- **THEN** the same input stays focused and centered, feedback uses success, and the next prompt appears without another tap
- **AND** input, feedback, and current action remain above the keyboard at standard text sizes

#### Scenario: Confirm and reveal a mistake

- **WHEN** a learner submits an incorrect draft, then chooses Show reading
- **THEN** error feedback first hides and then reveals the canonical reading without moving the input horizontally or grading again
- **AND** the feedback region preserves two lines of space between prompts and expands accessibly when needed

### Requirement: Typing results explain this round

Current and best consecutive-correct streaks SHALL be derived only from this round's immutable grades. Incorrect and revealed answers SHALL reset the current streak. Repeated events or edited drafts SHALL NOT change a recorded streak. The summary SHALL show the best streak and retain each submitted mistake alongside its canonical reading, distinguishing revealed answers from typed mistakes. These metrics SHALL reset for Repeat selection and Review mistakes and SHALL NOT create persistent daily streaks or modify scheduling.

#### Scenario: Finish and review a mixed round

- **WHEN** grades are correct, correct, incorrect, correct, revealed
- **THEN** best streak is two and current streak is zero
- **AND** the summary preserves the incorrect submitted draft and identifies the revealed answer
- **AND** reviewing mistakes begins with zero streak and an empty focused input
