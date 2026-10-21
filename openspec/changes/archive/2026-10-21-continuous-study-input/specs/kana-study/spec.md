## MODIFIED Requirements

### Requirement: A study round presents the selected cards once

Starting study SHALL snapshot the selected cards, shuffle their order, and show each card exactly once in that round. The study screen SHALL show one large kana prompt, its alphabet, a rōmaji input, answer actions, answered/total progress, and the running correct-answer count. The answer SHALL be hidden until the card is graded or revealed. A yōon combination SHALL count as one card. A round containing a single card SHALL be valid.

The input SHALL accept Latin text without automatic capitalization or correction. Typing or pasting a whole normalized canonical reading or accepted alias on an ungraded card SHALL grade it correct automatically without Enter or Check. An incomplete or wrong draft SHALL remain editable and SHALL NOT grade or advance until explicit submission. Blank or whitespace-only submission SHALL leave the card ungraded and show an instruction to enter an answer or reveal it. Typing during correct feedback SHALL follow the interruptible continuation rules; any buffered draft SHALL be checked against the next prompt after transition, with its own exactly-once grade and commit.

#### Scenario: Start a mixed round

- **WHEN** the learner starts with ten selected cards
- **THEN** the round has exactly those ten cards in shuffled order and starts at 0/10 answered
- **AND** it never introduces an unselected card or repeats a card before completion

#### Scenario: Incomplete and blank input

- **WHEN** the learner types `s` for し without submitting
- **THEN** no score changes and the prompt remains ungraded
- **AND** submitting a blank answer likewise does not consume the card

#### Scenario: One-card round

- **WHEN** only the syllabic n family from one alphabet is selected
- **THEN** a one-card round starts and can complete normally

### Requirement: Feedback resolves each card exactly once

A correct input match or submission SHALL show correct feedback and the canonical reading, then advance automatically after brief feedback. Explicitly submitting an incorrect draft SHALL show incorrect feedback and the submitted answer, retain the input, and add the card to the round's mistakes, WITHOUT exposing the canonical reading in visible text or accessibility output. The next Enter or Show reading action SHALL reveal the canonical reading without grading again. A subsequent Enter or Next SHALL continue; the final card SHALL instead offer Show results. Explicit Reveal answer on an ungraded card SHALL show the canonical reading immediately and count the card as incorrect, including when the input is empty. Correct feedback SHALL also permit immediate continuation.

Once graded or revealed, a card SHALL NOT accept further grading or change its result. Repeated taps, stale callbacks, timers, or keyboard events SHALL NOT score it twice or skip the next ungraded card. The immutable grade SHALL preserve the submitted answer. During correct feedback, appended characters that extend the current answer to another accepted alias (such as n to nn) SHALL stay with the current prompt; otherwise only newly entered text SHALL carry to the next card and interrupt the pause once advancement is allowed. Wrong/revealed drafts SHALL clear on continuation. Feedback SHALL use text or symbols as well as color.

#### Scenario: Correct answer

- **WHEN** the learner types or pastes `a` for ア
- **THEN** correct feedback is shown and both answered and correct counts increase by one
- **AND** the next card or final results appears automatically after brief feedback without Enter

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

### Requirement: Results support focused mistake review

After every card is resolved and the final correct feedback completes or the learner acknowledges the final incorrect/revealed answer, the application SHALL show the round's total, correct and incorrect counts, and accuracy rounded to the nearest integer percentage. It SHALL list each missed card with its alphabet and canonical reading. Accuracy SHALL equal correct divided by total times 100; revealed cards SHALL count as incorrect.

The summary SHALL offer Repeat selection and Change selection, plus Review mistakes when mistakes exist. Repeat selection SHALL start a newly shuffled round using the original selection snapshot, including when invoked after review. Review mistakes SHALL start a newly shuffled round containing only the distinct mistakes from the just-finished round, with fresh counters and the same checking rules. Review SHALL NOT alter saved family selections or retroactively change a completed round's score. Restarting either kind of round SHALL focus an empty answer input.

#### Scenario: Complete a round with mistakes

- **WHEN** a five-card round finishes with three correct answers, one incorrect answer, and one revealed answer
- **THEN** the summary shows 3 correct, 2 incorrect, and 60% accuracy
- **AND** Review mistakes starts a two-card round at 0/2 answered with focused empty input

#### Scenario: Complete a perfect round

- **WHEN** every card in a round is answered correctly
- **THEN** the summary appears automatically with 100% accuracy and a no-mistakes message
- **AND** Review mistakes is unavailable

#### Scenario: Repeat after reviewing mistakes

- **WHEN** the learner finishes a two-card review from an original ten-card selection and chooses Repeat selection
- **THEN** a fresh ten-card round starts with reset counters and focused empty input
- **AND** the saved selection remains unchanged

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
- **AND** revealing the reading leaves the complete correction and Next or results button visible together
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
