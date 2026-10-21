## MODIFIED Requirements

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL present an alphabet selector with per-alphabet counts, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Practice and Syllabary SHALL share the same circular kana cell component, kana/rōmaji typography, surface colors and compact cell sizing. Practice and Syllabary SHALL use one shared catalog control layout with matching top padding, glyph-led alphabet controls featuring あ and ア, category capsules and vowel headers. At the same viewport, font size and initial scroll position, alphabet and category bounds SHALL align between screens. Practice selection counts SHALL be compact secondary badges that do not change control height. Neither screen SHALL insert introductory copy before the controls. Enlarged-text layouts SHALL use the same stacking rules. The grid SHALL contain individually selectable kana/rōmaji cells with explicit selected checks and SHALL NOT add family-name headings absent from Syllabary. Practice SHALL show a separate checkbox beside each row for one-touch family selection, with unchecked, mixed and checked states. These controls SHALL have at least 44 logical pixels of touch area and SHALL NOT introduce family-name headings. Individual cells SHALL remain independent controls, including in partially selected rows. Vowel headers SHALL align with their cells. Controls SHALL have touch targets of at least 44 logical pixels. Basic/voiced cells SHALL preserve A/I/U/E/O alignment and empty YA/WA positions at normal text sizes; yōon SHALL use A/U/O. Enlarged text SHALL reflow without clipping. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a scheduled/free practice mode selector, and one Start study button SHALL occupy a compact bottom action area that does not cover the table. Scheduled review SHALL be the default mode; the selected mode SHALL be explicit and its purpose briefly explained. A zero-card selection SHALL disable Start study. On desktop web at 1024 logical pixels and wider, both catalogs SHALL use compact alphabet/category controls, a centered content width no greater than 1024 logical pixels, and two side-by-side blocks for categories with at least six families. Kana cells SHALL retain equal width and height with a maximum desktop diameter of 64 logical pixels. Native and narrow-web catalog layouts SHALL retain their mobile structure; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize a large central kana prompt with a subordinate alphabet label. A compact header SHALL contain an accessible Change selection close action, answered/total progress, correct count, and a thin progress indicator. The underlined rōmaji input, feedback, and current action SHALL form a bottom answer area reachable with the software keyboard. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise summary, actual round score, best consecutive-correct streak for this round, and a plain mistakes list with submitted-answer corrections. A compact current consecutive-correct count MAY appear alongside answered/total progress during typing. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

The study input SHALL be no wider than 192 logical pixels. Answer actions SHALL remain compact; an icon-only Check action SHALL expose the same accessible label as the text action. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana SHALL dominate the composition. The transient-round explanation SHALL remain a short footer sentence. Content SHALL scroll when screen height or enlarged text requires it.

The study surface SHALL NOT add guided-path navigation, lesson locks, daily or historical streaks, countdown timers, mastery indicators, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. Global navigation SHALL remain hidden during study and results.

#### Scenario: Minimal selection on a phone

- **WHEN** the learner opens selection at a 390-logical-pixel width
- **THEN** alphabet and category controls are clear and each kana is an independent control with a visible bulk checkbox beside every row
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

#### Scenario: Switch between catalog screens

- **WHEN** the learner switches between Syllabary and Practice at the initial scroll position
- **THEN** alphabet and category controls remain at the same vertical positions and heights
- **AND** Practice retains its saved selection and inline counts

#### Scenario: Select a row directly

- **WHEN** the learner taps the checkbox beside a partially selected row
- **THEN** every kana in that row becomes selected without opening another control
- **AND** tapping the checked row checkbox again clears only that row while leaving other rows unchanged
