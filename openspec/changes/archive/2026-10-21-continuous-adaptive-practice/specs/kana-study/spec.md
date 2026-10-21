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
- **THEN** starting free practice presents exactly い and the character can be answered repeatedly until the learner finishes

### Requirement: Study continues until the learner finishes

Starting study SHALL snapshot the selected cards as a reusable pool and present randomly selected prompts continuously until the learner explicitly finishes or leaves. The first prompt SHALL also be randomized. Only selected identities SHALL appear. Immediate repetition SHALL be avoided when more than one identity is available. A single selected character SHALL remain repeatable. Free practice SHALL sample uniformly among alternatives; intelligent practice SHALL use adaptive weights. A yōon combination SHALL count as one character.

The input SHALL preserve existing normalized-answer, alias, blank-input, correct auto-advance and wrong-answer acknowledgement behavior. The header SHALL show cumulative answered and correct counts without a fixed total or completion bar. An accessible Finish practice action SHALL show results based only on graded attempts, ignoring unfinished drafts, and SHALL wait for any graded review to save successfully. Repeated mistakes SHALL remain distinct result entries but mistake drills SHALL deduplicate the pool.

#### Scenario: Continue beyond the selection size

- **WHEN** the learner answers more prompts than the number of selected kana
- **THEN** practice continues using only the selected pool without an automatic results screen
- **AND** finishing explicitly shows totals and accuracy for all graded attempts

#### Scenario: Single character and empty finish

- **WHEN** one kana is selected
- **THEN** it can repeat indefinitely and stale events cannot grade the next occurrence
- **AND** finishing before answering produces zero answers without scoring the draft

#### Scenario: Reopen the same selection

- **WHEN** the learner starts multiple sessions with the same selection
- **THEN** the first and subsequent prompts are random rather than fixed catalog or due order

### Requirement: Feedback resolves each card exactly once

A correct input match or submission SHALL show correct feedback and the canonical reading, then advance automatically after brief feedback. Explicitly submitting an incorrect draft SHALL show incorrect feedback and the submitted answer, retain the input, and add the card to the round's mistakes, WITHOUT exposing the canonical reading in visible text or accessibility output. The next Enter or Show reading action SHALL reveal the canonical reading without grading again. A subsequent Enter or Next SHALL continue; practice SHALL continue until the learner chooses Finish practice. Explicit Reveal answer on an ungraded card SHALL show the canonical reading immediately and count the card as incorrect, including when the input is empty. Correct feedback SHALL also permit immediate continuation.

Once graded or revealed, a card SHALL NOT accept further grading or change its result. Repeated taps, stale callbacks, timers, or keyboard events SHALL NOT score it twice or skip the next ungraded card. The immutable grade SHALL preserve the submitted answer. During correct feedback, appended characters that extend the current answer to another accepted alias (such as n to nn) SHALL stay with the current prompt; otherwise only newly entered text SHALL carry to the next card and interrupt the pause once advancement is allowed. Wrong/revealed drafts SHALL clear on continuation. Feedback SHALL use text or symbols as well as color.

#### Scenario: Correct answer

- **WHEN** the learner types or pastes `a` for ア
- **THEN** correct feedback is shown and both answered and correct counts increase by one
- **AND** the next card appears automatically after brief feedback without Enter

#### Scenario: Incorrect or revealed answer

- **WHEN** the learner submits `ka` for う
- **THEN** incorrect feedback and `ka` are shown, `u` remains hidden, answered increases by one, and correct does not increase
- **AND** a second Enter or Show reading reveals `u` without another grade
- **AND** a third Enter or Next continues, with う included once in the round's mistakes

#### Scenario: Correct a draft before confirming an error

- **WHEN** the learner types `a` for え, erases it, and types `e`
- **THEN** the wrong draft never grades and the corrected whole reading grades correct automatically

#### Scenario: Extend an accepted alias during feedback

- **WHEN** the learner types `n` then extends it to `nn` while the ん prompt is still visible
- **THEN** one correct grade is recorded and the alias extension does not appear as a stray n on the following prompt
- **AND** pasting a whole accepted alias also grades exactly once

#### Scenario: Duplicate submission

- **WHEN** Check answer is activated twice on a card already graded or an old event arrives after progression
- **THEN** only its first result is counted and the next card remains unanswered

#### Scenario: Fast typing during correct feedback

- **WHEN** the learner starts typing immediately after a correct submission
- **THEN** the new characters are retained for the next card and advancement does not impose the remaining feedback delay
- **AND** a complete matching buffered draft grades the next prompt without another Enter, while a partial or wrong draft remains editable

### Requirement: Study uses a restrained warm visual identity

In light mode, selection, study, and results SHALL share a light cream canvas, dark brown text, muted warm secondary text, and one vermilion primary accent. Repeated colors SHALL be semantic tokens in `src/global.css` using these sRGB values. The separately specified app preferences provide a corresponding dark palette:

| Token                | Value     | Role                                               |
| -------------------- | --------- | -------------------------------------------------- |
| `background`         | `#fdfbf7` | Continuous page background                         |
| `foreground`         | `#32191c` | Main text and kana                                 |
| `muted`              | `#f7f1eb` | Quiet control backgrounds                          |
| `muted-foreground`   | `#806a67` | Supporting text and rōmaji previews                |
| `border`             | `#e6dfd6` | Neutral separators                                 |
| `primary`            | `#d13b2b` | Primary action, selected edge/indicator, and focus |
| `primary-foreground` | `#fefaf1` | Text on the primary action                         |
| `accent`             | `#fce8df` | Selected-family background                         |
| `success`            | `#2f6b4f` | Correct-answer feedback                            |
| `error`              | `#b42318` | Incorrect-answer feedback                          |

The interface SHALL use a readable sans-serif hierarchy, Japanese-capable glyph rendering, consistent spacing, flat grouping, and subtle rounded control corners. At most one action per screen state SHALL use a filled primary treatment. Feedback SHALL retain explicit correct/incorrect labels or symbols. Normal text SHALL achieve at least 4.5:1 contrast and selected/focus indicators at least 3:1 against adjacent colors. Text on `accent` or `muted` surfaces SHALL use `foreground`, including rōmaji in selected rows; `muted-foreground` SHALL be reserved for supporting text on `background`. Decorative gradients, nested elevated cards, and separate decorative tiles around every kana preview SHALL NOT be part of this feature's visual treatment.

#### Scenario: Consistent palette across the study loop

- **WHEN** a learner moves from selection to study and results
- **THEN** background, text, primary actions, and feedback use the same semantic palette
- **AND** selected families use the peach accent fill with a vermilion edge or indicator and a non-color selected cue

#### Scenario: Clear action hierarchy

- **WHEN** a card is awaiting an answer
- **THEN** Check answer is the filled primary action and Reveal answer is secondary
- **AND** after grading, Next replaces Check answer as the filled primary action

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL present an alphabet selector with per-alphabet counts, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Practice and Syllabary SHALL share the same circular kana cell component, kana/rōmaji typography, surface colors and compact cell sizing. Practice and Syllabary SHALL use one shared catalog control layout with matching top padding, glyph-led alphabet controls featuring あ and ア, category capsules and vowel headers. At the same viewport, font size and initial scroll position, alphabet and category bounds SHALL align between screens. Practice selection counts SHALL be compact secondary badges that do not change control height. Neither screen SHALL insert introductory copy before the controls. Enlarged-text layouts SHALL use the same stacking rules. The grid SHALL contain individually selectable kana/rōmaji cells with explicit selected checks and SHALL NOT add family-name headings absent from Syllabary. Practice SHALL show a separate checkbox beside each row for one-touch family selection, with unchecked, mixed and checked states. These controls SHALL have at least 44 logical pixels of touch area and SHALL NOT introduce family-name headings. Individual cells SHALL remain independent controls, including in partially selected rows. Vowel headers SHALL align with their cells. Controls SHALL have touch targets of at least 44 logical pixels. Basic/voiced cells SHALL preserve A/I/U/E/O alignment and empty YA/WA positions at normal text sizes; yōon SHALL use A/U/O. Enlarged text SHALL reflow without clipping. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a scheduled/free practice mode selector, and one Start study button SHALL occupy a compact bottom action area that does not cover the table. Scheduled review SHALL be the default mode; the selected mode SHALL be explicit and its purpose briefly explained. A zero-card selection SHALL disable Start study. On desktop web at 1024 logical pixels and wider, both catalogs SHALL use compact alphabet/category controls, a centered content width no greater than 1024 logical pixels, and two side-by-side blocks for categories with at least six families. Kana cells SHALL retain equal width and height with a maximum desktop diameter of 64 logical pixels. Native and narrow-web catalog layouts SHALL retain their mobile structure; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize a large central kana prompt with a subordinate alphabet label. A compact header SHALL contain an accessible Change selection close action, cumulative answered count, correct count, and an explicit Finish practice action. The underlined rōmaji input, feedback, and current action SHALL form a bottom answer area reachable with the software keyboard. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise summary, actual round score, best consecutive-correct streak for this round, and a plain mistakes list with submitted-answer corrections. A compact current consecutive-correct count MAY appear alongside cumulative answered count during typing. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

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
- **AND** choosing intelligent review instead starts adaptive practice with the full selection

#### Scenario: Focused study on a wide screen

- **WHEN** study is shown on a desktop-width viewport
- **THEN** the prompt, input, feedback, and answer actions form a centered column no wider than 512 logical pixels
- **AND** the kana has stronger visual emphasis than the progress and correct-count labels

#### Scenario: Answer on a phone

- **WHEN** the software keyboard opens
- **THEN** the input and answer action remain reachable, the prompt stays readable, and explicit submission still grades only once
- **AND** feedback and Next and Finish practice stay reachable after grading

#### Scenario: Simplified results

- **WHEN** the learner explicitly finishes free practice with mistakes
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

### Requirement: The study loop is accessible and locally available

The selection, study, and results screens SHALL work on iOS, Android, and web. Installed native apps and already-loaded web pages SHALL support the complete loop without network connectivity or account sign-in. The application SHALL NOT require a backend response to select cards, validate answers, or review mistakes.

At a 320-logical-pixel viewport, content SHALL fit without horizontal scrolling and primary actions SHALL remain reachable with the software keyboard open. Interactive targets SHALL be at least 44 by 44 logical pixels. Controls SHALL expose accessible names, selected/disabled states, and visible keyboard focus on web. Feedback SHALL be announced accessibly. Screen-reader prompt labels SHALL identify the alphabet and kana without adding a hidden rōmaji answer before grading. Enlarged system text SHALL remain readable without hiding actions. The answer input SHALL focus when a round begins and remain mounted, editable, and focused through grading and advancement, allowing consecutive answers without tapping it or reopening the keyboard.

At normal system text sizes on portrait phones, the complete answer input, grading feedback, and current action SHALL be visible together above the software keyboard without scrolling. The kana SHALL resize to the available vertical space while remaining legible instead of pushing the answer area out of the viewport. Keyboard and safe-area space SHALL NOT be subtracted twice. At extreme accessibility text sizes or exceptionally short viewports, scrolling MAY be required, but input, full feedback, and actions SHALL remain reachable with the keyboard open and without losing the draft or focus.

#### Scenario: Study offline

- **WHEN** connectivity is lost after the web app loads or while using the installed native app
- **THEN** selection, answering, results, and mistake review remain usable

#### Scenario: Use a narrow screen with the keyboard open

- **WHEN** the learner studies at 320 logical pixels wide with the software keyboard visible
- **THEN** the prompt, input, feedback, and current primary action can be reached without horizontal scrolling

#### Scenario: Correct a mistake with the software keyboard open

- **WHEN** a learner submits an incorrect answer on a portrait phone at normal text size
- **THEN** the entire input, incorrect feedback, submitted answer, and Show reading button are visible above the keyboard without scrolling
- **AND** revealing the reading leaves the complete correction and Next and Finish practice button visible together
- **AND** the prompt shrinks to leave room for feedback instead of clipping the button

#### Scenario: Enlarged text and reduced height

- **WHEN** the viewport shrinks or system text is enlarged during study
- **THEN** the prompt gives available space to the input, feedback, saving/error status, and current action
- **AND** any unavoidable overflow can be scrolled with the keyboard open while the same input retains its draft and focus

#### Scenario: Use assistive technology or a hardware keyboard

- **WHEN** a learner selects a family or submits an answer using a screen reader or hardware keyboard
- **THEN** selection states, grading feedback, and progress are accessible
- **AND** correct input matches advance automatically, while Enter confirms a wrong draft, reveals its reading, then continues in separate steps

#### Scenario: Consecutive answers

- **WHEN** a learner submits several answers using the software or hardware keyboard
- **THEN** the same input retains focus across cards and no tap on the input is required

### Requirement: Results support focused mistake review

When the learner explicitly finishes, the application SHALL show graded attempt counts and accuracy rounded to the nearest integer percentage. Unanswered prompts and drafts SHALL be excluded. Each missed attempt SHALL retain its alphabet, submitted answer and canonical reading, including multiple attempts at the same character. Revealed answers SHALL count as incorrect. Zero graded answers SHALL show zero accuracy.

Free-practice results SHALL offer Repeat selection and Change selection, plus Review mistakes when mistakes exist. Repeat selection SHALL start continuous random practice from the original selection, including after a mistake drill. Review mistakes SHALL use only distinct missed identities from the just-finished session, reset counters and focus an empty input. Neither action SHALL mutate saved selection or FSRS progress. Intelligent-practice results SHALL provide an action returning to selection.

#### Scenario: Finish a mixed session

- **WHEN** the learner finishes after three correct, one incorrect and one revealed answer
- **THEN** results show five attempts, three correct, two incorrect and 60% accuracy
- **AND** reviewing mistakes starts continuous practice with only distinct missed kana and zero answers

#### Scenario: Finish a perfect session

- **WHEN** the learner finishes after answering all attempted prompts correctly
- **THEN** the summary shows 100% accuracy and no mistakes
- **AND** results never appear automatically after merely covering the selection

#### Scenario: Repeat after reviewing mistakes

- **WHEN** the learner finishes a two-kana mistake drill from a ten-kana selection and chooses Repeat selection
- **THEN** all ten original kana are eligible again with reset counters and a focused empty input

## RENAMED Requirements

- FROM: `### Requirement: A study round presents the selected cards once`
- TO: `### Requirement: Study continues until the learner finishes`
