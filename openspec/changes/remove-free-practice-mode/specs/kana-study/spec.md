## MODIFIED Requirements

### Requirement: Learners select families across both alphabets

The Kana screen SHALL offer Hiragana and Katakana views and three catalog sections. Spanish category names SHALL be Básicos, Tenten / Maru, and Combinados; their English equivalents SHALL be Basic, Tenten / Maru, and Combined. The names SHALL retain the existing catalog groups and internal IDs. Every kana SHALL be independently selectable from its detail sheet, which shows its canonical reading. Each family SHALL have a separate bulk toggle: selecting an incomplete family selects all its cards, and toggling a complete family clears it. Family controls SHALL expose unchecked, mixed, or checked state. Switching alphabet or category SHALL retain all selections. Select all and Clear SHALL affect only the visible alphabet. Counts per alphabet and the combined total SHALL count individual cards.

First use SHALL select only the five hiragana vowels. An empty selection SHALL disable Start and request at least one kana. Study and Home resume SHALL use the exact selected cards, including a one-card subset of a larger family. Existing family-based study links SHALL remain valid.

#### Scenario: Individual and partial family selection

- **WHEN** a learner deselects い from the default vowels
- **THEN** exactly four vowels remain selected and the family control is mixed
- **AND** toggling that family selects all five; toggling it again clears all five

#### Scenario: Mixed selection and scoped bulk actions

- **WHEN** one hiragana kana and one katakana kana are selected across different categories
- **THEN** switching categories preserves both selections and Start snapshots only those two cards
- **AND** Select all then Clear on Katakana changes its count to 107 then zero without changing Hiragana

#### Scenario: Empty selection

- **WHEN** no kana are selected
- **THEN** Start is disabled and the guidance asks for at least one kana

#### Scenario: One-card subset

- **WHEN** only い is selected from the vowels
- **THEN** starting study presents exactly い and the character can be answered repeatedly until the learner finishes

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL happen on the Kana screen: a title, an arcade alphabet selector with あ and ア glyphs and per-alphabet selected counts, the visible alphabet's reviewed coverage, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Each kana SHALL be a square tile with its kana and rōmaji, its saved state, and an explicit selected check that does not rely on colour. Kana SHALL show a separate checkbox beside each row for one-touch family selection, with unchecked, mixed and checked states. These controls SHALL have at least 44 logical pixels of touch area and SHALL NOT introduce family-name headings. Individual kana SHALL be added or removed from the detail sheet, including in partially selected rows. Vowel headers SHALL align with their tiles. Controls SHALL have touch targets of at least 44 logical pixels. Basic/voiced tiles SHALL preserve A/I/U/E/O alignment and empty YA/WA positions at normal text sizes; yōon SHALL use A/U/O. Enlarged text SHALL reflow without clipping. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a one-line explanation of intelligent review, and one Start study button SHALL occupy a compact bottom action area above the tab bar that does not cover the table. The Kana screen SHALL NOT offer a study mode selector; Start study SHALL always begin intelligent review with the selection. Transient free rounds SHALL remain available only to duels and existing study links. A zero-card selection SHALL disable Start study. Content SHALL be centred with a width no greater than 672 logical pixels; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize the kana card as the largest element. A compact header SHALL contain an accessible Change selection close action, the progress bar for finite rounds only (endless rounds show no bar), one summary line with the cumulative answered and correct counts in the muted text color, and an explicit Finish practice action. In keyboard mode the rōmaji input, feedback and a full-width current action SHALL form a bottom answer area; in touch mode the coins, Check and Skip SHALL form it and the feedback ribbon SHALL replace it after grading, pinned to the bottom edge. The input placeholder SHALL NOT disclose the answer. Results SHALL show the grade stamp, a scoreboard with points, accuracy, time and the best consecutive-correct streak for this round (shown once, not again as best combo), the totals, and a plain mistakes list with submitted-answer corrections. The current consecutive-correct streak SHALL join the summary line only while it is at least two. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; free rounds SHALL also offer Change selection; scheduled rounds SHALL return to selection. Result actions SHALL stay reachable at the bottom without scrolling past the mistakes list, and a success haptic SHALL accompany the results appearing.

The study input SHALL be no wider than 300 logical pixels. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana SHALL dominate the composition. The transient-round explanation SHALL remain a short footer sentence. Content SHALL scroll when screen height or enlarged text requires it.

The study surface SHALL NOT add guided-path navigation, lesson locks, countdown timers, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. Global navigation SHALL remain hidden during study and results.

#### Scenario: Minimal selection on a phone

- **WHEN** the learner opens selection at a 390-logical-pixel width
- **THEN** alphabet and category controls are clear and each kana is a tile with a visible bulk checkbox beside every row
- **AND** the compact start area stays above the tab bar and safe-area inset without obscuring the final family
- **AND** guided-path controls and historical-statistics panels are absent

#### Scenario: Select across categories and alphabets

- **WHEN** a learner selects a basic family, a voiced family, and a family from the other alphabet
- **THEN** changing the visible category or alphabet preserves all three selections and their combined count
- **AND** Select all and Clear affect the whole visible alphabet rather than only the visible category

#### Scenario: Start study without choosing a mode

- **WHEN** the learner opens the Kana screen and activates Start study
- **THEN** no study mode selector is shown and intelligent review starts with the exact selected kana
- **AND** answers to kana that are not yet due count in the round without moving their saved schedule

#### Scenario: Focused study on a wide screen

- **WHEN** study is shown on a desktop-width viewport
- **THEN** the card, input, feedback, and answer actions form a centered column no wider than 512 logical pixels
- **AND** the kana card has stronger visual emphasis than the progress and correct-count labels

#### Scenario: Answer on a phone

- **WHEN** a round runs on a phone
- **THEN** the card, coins, Check and Skip are visible together and no keyboard opens
- **AND** feedback and Continue and Finish practice stay reachable after grading

#### Scenario: Compact study header

- **WHEN** a learner has answered three prompts with two correct and a current streak of one
- **THEN** the header shows one muted summary such as `3 answered · 2 correct` between the close and Finish practice actions
- **AND** the streak appears in the same line only after two consecutive correct answers

#### Scenario: Simplified results

- **WHEN** the learner explicitly finishes a free duel round with mistakes
- **THEN** the grade, scoreboard and correct/incorrect totals appear above a plain mistakes list
- **AND** Review mistakes is the only filled primary action, with Repeat selection and Change selection secondary

#### Scenario: Pick one kana

- **WHEN** the learner opens い from a fully selected vowel row and removes it in the sheet
- **THEN** four vowels remain selected and the row checkbox is mixed

#### Scenario: Select a row directly

- **WHEN** the learner taps the checkbox beside a partially selected row
- **THEN** every kana in that row becomes selected without opening another control
- **AND** tapping the checked row checkbox again clears only that row while leaving other rows unchanged
