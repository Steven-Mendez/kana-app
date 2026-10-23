## MODIFIED Requirements

### Requirement: Feedback resolves each card exactly once

A correct input match or submission SHALL show correct feedback and the canonical reading, then advance automatically after brief feedback. Explicitly submitting an incorrect draft SHALL immediately show incorrect feedback, the canonical reading and the submitted answer in visible text and accessibility output, retain the input, and add the card to the round's mistakes. Incorrect answers SHALL NOT require a separate Show reading step and SHALL NOT advance automatically: the next Enter, Next or Continue SHALL continue; practice SHALL continue until the learner chooses Finish practice or a finite round ends. Explicit Reveal answer on an ungraded card SHALL show the canonical reading immediately and count the card as incorrect, including when the input is empty. Correct feedback SHALL also permit immediate continuation. In touch mode, Check grades the selected coin through the same rules, Skip acts as Reveal answer, and correct feedback SHALL NOT advance automatically: it stays until the learner presses Continue.

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

#### Scenario: Grade a coin twice

- **WHEN** Check is activated twice for the same selected coin
- **THEN** one grade is recorded and the next prompt remains ungraded

### Requirement: Results support focused mistake review

When the learner explicitly finishes or a finite round ends, the application SHALL show graded attempt counts and accuracy rounded to the nearest integer percentage, together with the round's grade, points, best combo and time. Unanswered prompts and drafts SHALL be excluded. Each missed attempt SHALL retain its alphabet, submitted answer and canonical reading, including multiple attempts at the same character. Revealed answers SHALL count as incorrect. Zero graded answers SHALL show zero accuracy and no grade.

Free-practice results SHALL offer Repeat selection and Change selection, plus Review mistakes when mistakes exist. Repeat selection SHALL start a new round of the same length from the original selection, including after a mistake drill. Review mistakes SHALL use only distinct missed identities from the just-finished session, reset counters and focus an empty input or show fresh coins. Neither action SHALL mutate saved selection or FSRS progress. Intelligent-practice results SHALL provide an action returning to selection. When the round saved the first review of the local day, results SHALL also show the extended daily streak, as a milestone when it reaches one.

#### Scenario: Finish a mixed session

- **WHEN** the learner finishes after three correct, one incorrect and one revealed answer
- **THEN** results show five attempts, three correct, two incorrect and 60% accuracy with grade C
- **AND** reviewing mistakes starts a round with only distinct missed kana and zero answers

#### Scenario: Finish a perfect session

- **WHEN** the learner finishes after answering all attempted prompts correctly
- **THEN** the summary shows 100% accuracy, grade S and no mistakes
- **AND** results never appear automatically in an endless round after merely covering the selection

#### Scenario: Repeat after reviewing mistakes

- **WHEN** the learner finishes a two-kana mistake drill from a ten-kana selection and chooses Repeat selection
- **THEN** all ten original kana are eligible again with reset counters and a focused empty input

### Requirement: Study uses a restrained warm visual identity

Selection, study and results SHALL share the app palette in `src/global.css`: the cream background, dark brown text, muted warm secondary text and the vermilion primary accent. Study and results SHALL use the arcade game components and roles: outlined pieces with a solid edge, the vermilion primary `GameButton`, the kana card, coins, the progress bar with kitsunebi, the feedback ribbon, gold for correct and excellence and sumi for wrong answers. Repeated colors SHALL be semantic tokens; components SHALL NOT use literal colors.

The interface SHALL use the display, UI and kana families of the theme, consistent spacing and rounded game pieces. At most one action per screen state SHALL use the filled primary treatment. Feedback SHALL retain explicit correct/incorrect text and a non-colour cue (stamp or flipped card). Normal text SHALL achieve at least 4.5:1 contrast and selected/focus indicators at least 3:1 against adjacent colors. Decorative gradients SHALL NOT be used.

#### Scenario: Consistent palette across the study loop

- **WHEN** a learner moves from selection to study and results
- **THEN** background, text, primary actions and feedback use the same semantic palette
- **AND** a correct answer is shown with the stamp and gold, a wrong one with the flipped sumi card, each with text

#### Scenario: Clear action hierarchy

- **WHEN** a card is awaiting an answer
- **THEN** Check answer is the filled primary action and Reveal answer or Skip is secondary
- **AND** after grading, Next or Continue replaces Check answer as the filled primary action

### Requirement: Screen composition keeps the learning task prominent

Selection SHALL present an alphabet selector with per-alphabet counts, a category selector for the three catalog sections, alphabet-scoped bulk actions, and a vertically scrolling table of families in the chosen category. Practice and Syllabary SHALL share the same circular kana cell component, kana/rōmaji typography, surface colors and compact cell sizing. Practice and Syllabary SHALL use one shared catalog control layout with matching top padding, glyph-led alphabet controls featuring あ and ア, category capsules and vowel headers. At the same viewport, font size and initial scroll position, alphabet and category bounds SHALL align between screens. Practice selection counts SHALL be compact secondary badges that do not change control height. Neither screen SHALL insert introductory copy before the controls. Enlarged-text layouts SHALL use the same stacking rules. The grid SHALL contain individually selectable kana/rōmaji cells with explicit selected checks and SHALL NOT add family-name headings absent from Syllabary. Practice SHALL show a separate checkbox beside each row for one-touch family selection, with unchecked, mixed and checked states. These controls SHALL have at least 44 logical pixels of touch area and SHALL NOT introduce family-name headings. Individual cells SHALL remain independent controls, including in partially selected rows. Vowel headers SHALL align with their cells. Controls SHALL have touch targets of at least 44 logical pixels. Basic/voiced cells SHALL preserve A/I/U/E/O alignment and empty YA/WA positions at normal text sizes; yōon SHALL use A/U/O. Enlarged text SHALL reflow without clipping. Switching category SHALL preserve all selections. The initial category SHALL be basic kana. The combined count, a scheduled/free practice mode selector, and one Start study button SHALL occupy a compact bottom action area that does not cover the table. Scheduled review SHALL be the default mode; the selected mode SHALL be explicit and its purpose briefly explained. A zero-card selection SHALL disable Start study. On desktop web at 1024 logical pixels and wider, both catalogs SHALL use compact alphabet/category controls, a centered content width no greater than 1024 logical pixels, and two side-by-side blocks for categories with at least six families. Kana cells SHALL retain equal width and height with a maximum desktop diameter of 64 logical pixels. Native and narrow-web catalog layouts SHALL retain their mobile structure; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize the kana card as the largest element. A compact header SHALL contain an accessible Change selection close action, the progress bar, one summary line with the cumulative answered and correct counts in the muted text color, and an explicit Finish practice action. In keyboard mode the rōmaji input, feedback and current action SHALL form a bottom answer area; in touch mode the coins, Check and Skip SHALL form it and the feedback ribbon SHALL replace it after grading. The input placeholder SHALL NOT disclose the answer. Results SHALL show the grade stamp, a scoreboard with points, best combo, accuracy and time, the totals, the best consecutive-correct streak for this round, and a plain mistakes list with submitted-answer corrections. The current consecutive-correct streak SHALL join the summary line only while it is at least two. Review mistakes SHALL be primary when available and Repeat selection primary otherwise; scheduled rounds SHALL return to selection.

The study input SHALL be no wider than 300 logical pixels. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana SHALL dominate the composition. The transient-round explanation SHALL remain a short footer sentence. Content SHALL scroll when screen height or enlarged text requires it.

The study surface SHALL NOT add guided-path navigation, lesson locks, countdown timers, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. Global navigation SHALL remain hidden during study and results.

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

- **WHEN** the learner explicitly finishes free practice with mistakes
- **THEN** the grade, scoreboard and correct/incorrect totals appear above a plain mistakes list
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

At a 320-logical-pixel viewport, content SHALL fit without horizontal scrolling and primary actions SHALL remain reachable. Interactive targets SHALL be at least 44 by 44 logical pixels. Controls SHALL expose accessible names, selected/disabled states, and visible keyboard focus on web. Feedback SHALL be announced accessibly. Screen-reader prompt labels SHALL identify the kana without adding a hidden rōmaji answer before grading. Enlarged system text SHALL remain readable without hiding actions. In keyboard mode the answer input SHALL focus when a round begins and remain mounted, editable, and focused through grading and advancement, allowing consecutive answers without tapping it.

In keyboard mode at normal system text sizes, the complete answer input, grading feedback, and current action SHALL be visible together without scrolling. In touch mode the card, coins and current action SHALL be visible together on a portrait phone at normal text size. At extreme accessibility text sizes or exceptionally short viewports, scrolling MAY be required, but the answer controls, full feedback and actions SHALL remain reachable without losing the draft, selection or focus.

#### Scenario: Study offline

- **WHEN** connectivity is lost after the web app loads or while using the installed native app
- **THEN** selection, answering, results, and mistake review remain usable

#### Scenario: Use a narrow screen

- **WHEN** the learner studies at 320 logical pixels wide
- **THEN** the card, coins or input, feedback, and current primary action can be reached without horizontal scrolling

#### Scenario: Enlarged text and reduced height

- **WHEN** the viewport shrinks or system text is enlarged during study
- **THEN** the card gives available space to the answer controls, feedback, saving/error status, and current action
- **AND** any unavoidable overflow can be scrolled while the same input retains its draft and focus

#### Scenario: Use assistive technology or a hardware keyboard

- **WHEN** a learner selects a family or submits an answer using a screen reader or hardware keyboard
- **THEN** selection states, grading feedback, and progress are accessible
- **AND** correct input matches advance automatically, while Enter confirms a wrong draft and shows its reading, then a second Enter continues

#### Scenario: Consecutive answers

- **WHEN** a learner submits several answers using the hardware keyboard
- **THEN** the same input retains focus across cards and no tap on the input is required

### Requirement: Mobile typing feedback is stable and explicit

In keyboard mode the prompt SHALL be the kana card. Correct grades SHALL stamp the card and color the input underline with success; incorrect or revealed grades SHALL flip the card to its back and color the underline with error, accompanied by textual feedback. A feedback status symbol SHALL align with the first line of its text. Input and feedback SHALL remain in a centered column. At normal text sizes, grading SHALL NOT horizontally move the input or move the card merely because feedback appears: the submit footprint and two feedback lines SHALL be reserved. Long answers and enlarged text MAY grow the feedback region with scroll access rather than truncating the answer.

The existing input SHALL remain mounted and focused across prompt changes. Correct matches SHALL continue to advance automatically; wrong drafts SHALL remain editable until submitted, and confirmed mistakes SHALL show their reading immediately and wait for Enter or Next before continuing. Scheduled reviews SHALL retain exactly-once commits and failure/retry gating.

#### Scenario: Type continuously

- **WHEN** a learner types consecutive correct readings
- **THEN** the same input stays focused and centered, feedback uses success, and the next prompt appears without another click

#### Scenario: Confirm a mistake

- **WHEN** a learner submits an incorrect draft
- **THEN** error feedback shows the canonical reading and the submitted answer at once without moving the input horizontally
- **AND** Enter or Next continues without grading again
- **AND** the feedback region preserves two lines of space between prompts and expands accessibly when needed

### Requirement: Study continues until the learner finishes

Starting study SHALL snapshot the selected cards as a reusable pool and present randomly selected prompts until the learner explicitly finishes or leaves, or a finite round reaches its length. The first prompt SHALL also be randomized. Only selected identities SHALL appear. Immediate repetition SHALL be avoided when more than one identity is available. A single selected character SHALL remain repeatable. Free practice SHALL sample uniformly among alternatives; intelligent practice SHALL use adaptive weights. A yōon combination SHALL count as one character.

The input SHALL preserve existing normalized-answer, alias, blank-input, correct auto-advance and wrong-answer acknowledgement behavior. In endless rounds the header SHALL show cumulative answered and correct counts without a fixed total; finite rounds SHALL also show their progress toward the round length. An accessible Finish practice action SHALL show results based only on graded attempts, ignoring unfinished drafts, and SHALL wait for any graded review to save successfully. Repeated mistakes SHALL remain distinct result entries but mistake drills SHALL deduplicate the pool.

#### Scenario: Continue beyond the selection size

- **WHEN** the learner answers more prompts than the number of selected kana in an endless round
- **THEN** practice continues using only the selected pool without an automatic results screen
- **AND** finishing explicitly shows totals and accuracy for all graded attempts

#### Scenario: Single character and empty finish

- **WHEN** one kana is selected
- **THEN** it can repeat indefinitely and stale events cannot grade the next occurrence
- **AND** finishing before answering produces zero answers without scoring the draft

#### Scenario: Reopen the same selection

- **WHEN** the learner starts multiple sessions with the same selection
- **THEN** the first and subsequent prompts are random rather than fixed catalog or due order
