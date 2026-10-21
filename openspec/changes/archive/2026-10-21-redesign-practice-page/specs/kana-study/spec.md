## MODIFIED Requirements

### Requirement: Study uses a restrained warm visual identity

In light mode, selection, study, and results SHALL share an ivory canvas, warm near-black text, muted brown secondary text, and one deep vermilion primary accent. Repeated colors SHALL be semantic tokens in `src/global.css` using these sRGB values. The separately specified app preferences provide a corresponding contrasting dark palette:

| Token                | Value     | Role                                                   |
| -------------------- | --------- | ------------------------------------------------------ |
| `background`         | `#fdfbf7` | Continuous page background                             |
| `surface`            | `#ffffff` | Kana medallions and selected alphabet surface          |
| `foreground`         | `#231d1a` | Main text and kana                                     |
| `muted`              | `#f1ece5` | Quiet control backgrounds                              |
| `muted-foreground`   | `#74665e` | Supporting text and rōmaji previews                    |
| `border`             | `#e6dfd6` | Neutral separators                                     |
| `primary`            | `#b83528` | Primary action, selected medallions, indicators, focus |
| `primary-foreground` | `#fefaf1` | Text on the primary fill                               |
| `accent`             | `#f9e4dc` | Selected-family background                             |
| `success`            | `#2f6b4f` | Correct-answer feedback                                |
| `error`              | `#b42318` | Incorrect-answer feedback                              |

The interface SHALL use a readable sans-serif hierarchy, Japanese-capable glyph rendering, consistent spacing, rounded panels and capsule controls. Practice SHALL use circular kana medallions within flat family groups, with a selected ring and explicit check. At most one action per screen state SHALL use a filled primary treatment; selected kana are selection indicators rather than additional primary actions. Feedback SHALL retain explicit correct/incorrect labels or symbols. Normal text SHALL achieve at least 4.5:1 contrast and selected/focus indicators at least 3:1 against adjacent colors. Text on `accent` or `muted` surfaces SHALL use `foreground`; primary-filled medallions SHALL use `primary-foreground`. Decorative gradients and nested elevated cards SHALL NOT be part of this feature's visual treatment.

#### Scenario: Consistent palette across the study loop

- **WHEN** a learner moves from selection to study and results
- **THEN** background, text, primary actions, and feedback use the same semantic palette
- **AND** selected families use a warm accent fill, vermilion medallions, and a non-color selected cue

#### Scenario: Clear action hierarchy

- **WHEN** a card is awaiting an answer
- **THEN** Check answer is the filled primary action and Reveal answer is secondary
- **AND** after grading, Next or Show results replaces Check answer as the filled primary action

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL begin directly with capsule-segmented glyph-led Hiragana/Katakana choices with per-alphabet counts, followed by category navigation for the three catalog sections, without a redundant introduction card. The selected category SHALL show named whole-family rows with prominent circular kana medallions and small rōmaji readings beneath them. Basic and voiced families SHALL align to five A/I/U/E/O columns at standard phone text sizes, preserving empty YA/WA vowel positions. Standalone N SHALL remain available without implying a vowel reading. Yōon SHALL use three A/U/O columns. Each row SHALL select its entire family and expose an explicit selected check and accessible checkbox state; medallions SHALL NOT be individual selection controls. Switching category or alphabet SHALL preserve all selections. The initial category SHALL be basic kana. Alphabet-wide Select all and Clear actions SHALL follow the matrix with their scope labeled.

The fixed bottom action area SHALL contain the combined selected count or empty-selection guidance, a secondary current-mode disclosure, and one short Start action. Mode selection SHALL be beside Start rather than in the page header. Opening the disclosure SHALL reveal scheduled/free choices and their explanations in a bounded scrollable panel above the footer; choosing an option SHALL close the panel, and the disclosure SHALL also close it without changing mode. Scheduled SHALL remain the default. A zero-card selection SHALL disable Start. On wide screens selection SHALL remain centered and no wider than 896 logical pixels; phone side gutters SHALL be at least 16 logical pixels. Text, kana pairs, and footer controls SHALL reflow rather than clip at enlarged sizes.

Study SHALL prioritize a large central kana prompt with a subordinate alphabet label. A compact header SHALL contain an accessible Change selection close action, answered/total progress, correct count, and a thin progress indicator. The underlined rōmaji input, feedback, and current action SHALL form a bottom answer area reachable with the software keyboard. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise summary, actual round score, and a plain mistakes list. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

The study input SHALL be no wider than 192 logical pixels. Answer actions SHALL remain compact; an icon-only Check action SHALL expose the same accessible label as the text action. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana SHALL dominate the composition. The transient-round explanation SHALL remain a short footer sentence. Content SHALL scroll when screen height or enlarged text requires it.

The study surface SHALL NOT add guided-path navigation, lesson locks, streaks, timers, mastery indicators, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. Global navigation SHALL remain hidden during study and results.

#### Scenario: Visual selection on a phone

- **WHEN** the learner opens Practice at 390 logical pixels with standard text size
- **THEN** compact alphabet choices use representative glyphs and basic kana occupy five vowel columns with circular medallions
- **AND** each named row selects a complete family, including rows with empty vowel positions
- **AND** the footer shows the current selection, mode disclosure, and Start above the native tab bar

#### Scenario: Select across categories and alphabets

- **WHEN** a learner selects a basic family, a voiced family, and a family from the other alphabet
- **THEN** changing the visible category or alphabet preserves all three selections and their combined count
- **AND** Select all and Clear affect the whole visible alphabet rather than only the visible category

#### Scenario: Choose a study mode

- **WHEN** the learner opens the mode disclosure beside Start, chooses Free practice, and activates Start
- **THEN** a transient free-practice round starts with the selected families
- **AND** choosing Scheduled review instead starts the existing due-card flow

#### Scenario: Enlarged text on selection

- **WHEN** native or browser text is enlarged beyond the five-column layout's readable size
- **THEN** kana pairs reflow within their family, and selection, mode options, and Start remain reachable

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
