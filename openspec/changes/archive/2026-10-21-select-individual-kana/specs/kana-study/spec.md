## MODIFIED Requirements

### Requirement: Learners select families across both alphabets

The Practice screen SHALL offer Hiragana and Katakana views and three catalog sections. Spanish category names SHALL be Básicos, Tenten / Maru, and Combinados; their English equivalents SHALL be Basic, Tenten / Maru, and Combined. The names SHALL match Practice and Syllabary while retaining the existing catalog groups and internal IDs. Every kana SHALL be independently selectable with its canonical reading. Each family SHALL have a separate bulk toggle: selecting an incomplete family selects all its cards, and toggling a complete family clears it. Family controls SHALL expose unchecked, mixed, or checked state. Switching alphabet or category SHALL retain all selections. Select all and Clear SHALL affect only the visible alphabet. Counts per alphabet and the combined total SHALL count individual cards.

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
- **THEN** starting free practice presents exactly い and the round completes after one answer

### Requirement: Selection preferences survive reopening

The application SHALL save selected kana identities and the last visible alphabet locally and restore them before enabling study. A deliberately empty saved selection SHALL remain empty. Unknown or duplicate kana identities SHALL be removed when restoring; malformed or unreadable preferences SHALL fall back to the first-use selection. Storage failure SHALL leave study usable in memory and display a non-blocking notice that preferences could not be restored or saved. Initial rendering SHALL NOT overwrite stored preferences before restoration completes.

#### Scenario: Restore a customized selection

- **WHEN** the learner reopens the app after selecting individual kana in both alphabets
- **THEN** those selections and the last visible alphabet are restored
- **AND** starting a round uses the restored selection

#### Scenario: Restore an intentionally empty selection

- **WHEN** valid saved preferences contain no selected kana
- **THEN** the selection stays empty and Start study stays disabled

#### Scenario: Handle stale or invalid preferences

- **WHEN** saved preferences include known, unknown, and duplicate kana identities
- **THEN** only distinct known identities are restored
- **AND** malformed data or a failed read instead uses the first-use selection with a notice

#### Scenario: A save fails

- **WHEN** local storage rejects a preference write
- **THEN** the learner can continue selecting and studying with the current in-memory selection
- **AND** the screen does not claim that the preferences were saved

#### Scenario: Migrate family preferences

- **WHEN** valid legacy preferences contain selected family IDs
- **THEN** each known family expands to its individual kana IDs, preserving the visible alphabet and exact prior deck
- **AND** an intentionally empty selection remains empty and hydration does not write defaults

#### Scenario: Reopen a partial selection

- **WHEN** saved character preferences contain only い and キュ
- **THEN** reopening and Home resume use only those two cards
- **AND** an explicit empty character list takes precedence over any legacy family list

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL present an alphabet selector with per-alphabet counts, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Practice and Syllabary SHALL share the same rounded kana cell component, kana/rōmaji typography, surface colors and compact cell sizing. Practice SHALL use the same text-led alphabet and capsule category controls as Syllabary, with selection counts added. The grid SHALL contain individually selectable kana/rōmaji cells with explicit selected checks and SHALL NOT add family-name headings absent from Syllabary. A secondary collapsed-by-default family-selection disclosure below the grid SHALL expose separate bulk family controls with names, counts and mixed states. Controls SHALL have touch targets of at least 44 logical pixels. Basic/voiced cells SHALL preserve A/I/U/E/O alignment and empty YA/WA positions at normal text sizes; yōon SHALL use A/U/O. Enlarged text SHALL reflow without clipping. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a scheduled/free practice mode selector, and one Start study button SHALL occupy a compact bottom action area that does not cover the table. Scheduled review SHALL be the default mode; the selected mode SHALL be explicit and its purpose briefly explained. A zero-card selection SHALL disable Start study. On wide screens selection SHALL remain centered and no wider than 896 logical pixels; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize a large central kana prompt with a subordinate alphabet label. A compact header SHALL contain an accessible Change selection close action, answered/total progress, correct count, and a thin progress indicator. The underlined rōmaji input, feedback, and current action SHALL form a bottom answer area reachable with the software keyboard. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise summary, actual round score, best consecutive-correct streak for this round, and a plain mistakes list with submitted-answer corrections. A compact current consecutive-correct count MAY appear alongside answered/total progress during typing. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

The study input SHALL be no wider than 192 logical pixels. Answer actions SHALL remain compact; an icon-only Check action SHALL expose the same accessible label as the text action. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana SHALL dominate the composition. The transient-round explanation SHALL remain a short footer sentence. Content SHALL scroll when screen height or enlarged text requires it.

The study surface SHALL NOT add guided-path navigation, lesson locks, daily or historical streaks, countdown timers, mastery indicators, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. Global navigation SHALL remain hidden during study and results.

#### Scenario: Minimal selection on a phone

- **WHEN** the learner opens selection at a 390-logical-pixel width
- **THEN** alphabet and category controls are clear and each kana is an independent control with family bulk actions available in a secondary disclosure
- **AND** the compact start area stays above the tab bar and safe-area inset without obscuring the final family
- **AND** guided-path, mastery, and historical-statistics controls are absent

#### Scenario: Select across categories and alphabets

- **WHEN** a learner selects a basic family, a voiced family, and a family from the other alphabet
- **THEN** changing the visible category or alphabet preserves all three selections and their combined count
- **AND** Select all and Clear affect the whole visible alphabet rather than only the visible category

#### Scenario: Choose a study mode

- **WHEN** the learner chooses Free practice and activates Start study
- **THEN** a transient free-practice round starts with the exact selected kana
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
