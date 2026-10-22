## MODIFIED Requirements

### Requirement: Feedback resolves each card exactly once

A correct input match or submission SHALL show correct feedback and the canonical reading, then advance automatically after brief feedback. Explicitly submitting an incorrect draft SHALL immediately show incorrect feedback, the canonical reading and the submitted answer in visible text and accessibility output, retain the input, and add the card to the round's mistakes. Incorrect answers SHALL NOT require a separate Show reading step and SHALL NOT advance automatically: the next Enter or Next SHALL continue; practice SHALL continue until the learner chooses Finish practice. Explicit Reveal answer on an ungraded card SHALL show the canonical reading immediately and count the card as incorrect, including when the input is empty. Correct feedback SHALL also permit immediate continuation.

Once graded or revealed, a card SHALL NOT accept further grading or change its result. Repeated taps, stale callbacks, timers, or keyboard events SHALL NOT score it twice or skip the next ungraded card. The immutable grade SHALL preserve the submitted answer. During correct feedback, appended characters that extend the current answer to another accepted alias (such as n to nn) SHALL stay with the current prompt; otherwise only newly entered text SHALL carry to the next card and interrupt the pause once advancement is allowed. Wrong/revealed drafts SHALL clear on continuation. Feedback SHALL use text or symbols as well as color.

#### Scenario: Correct answer

- **WHEN** the learner types or pastes `a` for ア
- **THEN** correct feedback is shown and both answered and correct counts increase by one
- **AND** the next card appears automatically after brief feedback without Enter

#### Scenario: Incorrect or revealed answer

- **WHEN** the learner submits `ka` for う
- **THEN** incorrect feedback, the reading `u` and the submitted `ka` are shown and announced together, answered increases by one, and correct does not increase
- **AND** the prompt stays on う until a second Enter or Next continues, with う included once in the round's mistakes
- **AND** no Show reading action is offered

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

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL present an alphabet selector with per-alphabet counts, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Practice and Syllabary SHALL share the same circular kana cell component, kana/rōmaji typography, surface colors and compact cell sizing. Practice and Syllabary SHALL use one shared catalog control layout with matching top padding, glyph-led alphabet controls featuring あ and ア, category capsules and vowel headers. At the same viewport, font size and initial scroll position, alphabet and category bounds SHALL align between screens. Practice selection counts SHALL be compact secondary badges that do not change control height. Neither screen SHALL insert introductory copy before the controls. Enlarged-text layouts SHALL use the same stacking rules. The grid SHALL contain individually selectable kana/rōmaji cells with explicit selected checks and SHALL NOT add family-name headings absent from Syllabary. Practice SHALL show a separate checkbox beside each row for one-touch family selection, with unchecked, mixed and checked states. These controls SHALL have at least 44 logical pixels of touch area and SHALL NOT introduce family-name headings. Individual cells SHALL remain independent controls, including in partially selected rows. Vowel headers SHALL align with their cells. Controls SHALL have touch targets of at least 44 logical pixels. Basic/voiced cells SHALL preserve A/I/U/E/O alignment and empty YA/WA positions at normal text sizes; yōon SHALL use A/U/O. Enlarged text SHALL reflow without clipping. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a scheduled/free practice mode selector, and one Start study button SHALL occupy a compact bottom action area that does not cover the table. Scheduled review SHALL be the default mode; the selected mode SHALL be explicit and its purpose briefly explained. A zero-card selection SHALL disable Start study. On desktop web at 1024 logical pixels and wider, both catalogs SHALL use compact alphabet/category controls, a centered content width no greater than 1024 logical pixels, and two side-by-side blocks for categories with at least six families. Kana cells SHALL retain equal width and height with a maximum desktop diameter of 64 logical pixels. Native and narrow-web catalog layouts SHALL retain their mobile structure; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize a large central kana prompt with a subordinate alphabet label. A compact header SHALL contain an accessible Change selection close action, one summary line with the cumulative answered and correct counts in the muted text color, and an explicit Finish practice action. The underlined rōmaji input, feedback, and current action SHALL form a bottom answer area reachable with the software keyboard. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise summary, actual round score, best consecutive-correct streak for this round, and a plain mistakes list with submitted-answer corrections. The current consecutive-correct streak SHALL join that summary line only while it is at least two. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

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

#### Scenario: Compact study header

- **WHEN** a learner has answered three prompts with two correct and a current streak of one
- **THEN** the header shows one muted summary such as `3 answered · 2 correct` between the close and Finish practice actions
- **AND** the streak appears in the same line only after two consecutive correct answers

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
- **THEN** the entire input, incorrect feedback, canonical reading, submitted answer, and Next button are visible above the keyboard without scrolling
- **AND** Finish practice remains visible in the header
- **AND** the prompt shrinks to leave room for feedback instead of clipping the button

#### Scenario: Enlarged text and reduced height

- **WHEN** the viewport shrinks or system text is enlarged during study
- **THEN** the prompt gives available space to the input, feedback, saving/error status, and current action
- **AND** any unavoidable overflow can be scrolled with the keyboard open while the same input retains its draft and focus

#### Scenario: Use assistive technology or a hardware keyboard

- **WHEN** a learner selects a family or submits an answer using a screen reader or hardware keyboard
- **THEN** selection states, grading feedback, and progress are accessible
- **AND** correct input matches advance automatically, while Enter confirms a wrong draft and shows its reading, then a second Enter continues

#### Scenario: Consecutive answers

- **WHEN** a learner submits several answers using the software or hardware keyboard
- **THEN** the same input retains focus across cards and no tap on the input is required

### Requirement: Mobile typing feedback is stable and explicit

The typing prompt SHALL remain cardless and use the existing semantic color system. Correct grades SHALL color the kana and input underline with success; incorrect or revealed grades SHALL use error, accompanied by textual feedback. A feedback status symbol SHALL align with the first line of its text. Input and feedback SHALL remain in a centered column. At normal text sizes, grading SHALL NOT horizontally move the input or move the prompt merely because feedback appears: the submit footprint and two feedback lines SHALL be reserved. Long answers and enlarged text MAY grow the feedback region with scroll access rather than truncating the answer.

The existing input SHALL remain mounted and focused across prompt changes. Correct matches SHALL continue to advance automatically; wrong drafts SHALL remain editable until submitted, and confirmed mistakes SHALL show their reading immediately and wait for Enter or Next before continuing. Scheduled reviews SHALL retain exactly-once commits and failure/retry gating.

#### Scenario: Type continuously with the keyboard open

- **WHEN** a learner types consecutive correct readings on a portrait phone
- **THEN** the same input stays focused and centered, feedback uses success, and the next prompt appears without another tap
- **AND** input, feedback, and current action remain above the keyboard at standard text sizes

#### Scenario: Confirm a mistake

- **WHEN** a learner submits an incorrect draft
- **THEN** error feedback shows the canonical reading and the submitted answer at once without moving the input horizontally
- **AND** Enter or Next continues without grading again
- **AND** the feedback region preserves two lines of space between prompts and expands accessibly when needed
