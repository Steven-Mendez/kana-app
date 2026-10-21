# kana-study Specification

## Purpose

Define the scoped kana catalog, family selection, transient practice rounds, answer grading, and mistake review in an accessible, locally available study experience.

## Requirements

### Requirement: Both alphabets have a complete scoped study catalog

The application SHALL bundle 107 study cards per alphabet: 46 basic kana, 25 dakuten/handakuten kana, and 36 yōon combinations. Each card SHALL have a stable identity including its alphabet, its displayed kana, a family, a canonical rōmaji answer, and any accepted aliases. Cards with the same pronunciation SHALL remain distinct.

Basic families SHALL be a, ka, sa, ta, na, ha, ma, ya, ra, wa, and syllabic n. Voiced/semi-voiced families SHALL be ga, za, da, ba, and pa. Yōon families SHALL be kya, sha, cha, nya, hya, mya, rya, gya, ja (じゃ/ジャ), ja (ぢゃ/ヂャ), bya, and pya, each with its a/u/o combinations. Historical kana, standalone small kana, extended loanword combinations, and the long-vowel mark SHALL be outside this catalog.

#### Scenario: Catalog coverage

- **WHEN** all families in both alphabets are selected
- **THEN** the selection contains 214 uniquely identified cards
- **AND** every card has a nonempty canonical answer and belongs to exactly one family

#### Scenario: Equal readings do not collapse cards

- **WHEN** あ, ア, じ, and ぢ are included in a round
- **THEN** each is a separate prompt even though some share accepted answers

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

### Requirement: Rōmaji checking accepts explicit reading variants

Answer checking SHALL trim surrounding whitespace, ignore Latin letter case, and compare the whole answer against the current card's canonical answer and explicit aliases. Internal whitespace, prefixes, kana input, and unrelated readings SHALL NOT be accepted. Canonical readings SHALL use `shi`, `chi`, `tsu`, `fu`, `ji`, `zu`, `wo`, and `n` for the corresponding simple kana, and `sha/shu/sho`, `cha/chu/cho`, and `ja/ju/jo` for those yōon families.

The following aliases SHALL be accepted for both alphabets; unlisted cards SHALL accept only their canonical reading:

| Kana                                | Canonical       | Additional accepted answers                        |
| ----------------------------------- | --------------- | -------------------------------------------------- |
| し / シ                             | shi             | si                                                 |
| ち / チ                             | chi             | ti                                                 |
| つ / ツ                             | tsu             | tu                                                 |
| ふ / フ                             | fu              | hu                                                 |
| じ / ジ                             | ji              | zi                                                 |
| ぢ / ヂ                             | ji              | di                                                 |
| づ / ヅ                             | zu              | du                                                 |
| を / ヲ                             | wo              | o                                                  |
| ん / ン                             | n               | nn                                                 |
| しゃ・しゅ・しょ / シャ・シュ・ショ | sha / shu / sho | sya / syu / syo, respectively                      |
| ちゃ・ちゅ・ちょ / チャ・チュ・チョ | cha / chu / cho | tya or cya / tyu or cyu / tyo or cyo, respectively |
| じゃ・じゅ・じょ / ジャ・ジュ・ジョ | ja / ju / jo    | jya or zya / jyu or zyu / jyo or zyo, respectively |
| ぢゃ・ぢゅ・ぢょ / ヂャ・ヂュ・ヂョ | ja / ju / jo    | dya / dyu / dyo, respectively                      |

#### Scenario: Normalize an accepted answer

- **WHEN** the learner submits `SHI` or `si` for し
- **THEN** the answer is correct and the canonical reading remains `shi`

#### Scenario: Reject a prefix or unrelated reading

- **WHEN** the learner submits `s`, `sh i`, `し`, or `chi` for し
- **THEN** the answer is incorrect

#### Scenario: Keep aliases tied to the displayed kana

- **WHEN** the learner submits `di` for ぢ and `zi` for じ
- **THEN** both answers are correct
- **AND** `di` is not accepted for じ or `zi` for ぢ

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

### Requirement: Study navigation has predictable lifecycle behavior

The home route SHALL be `/` and study SHALL be reachable at `/study` through Expo Router. Study setup from navigation SHALL be validated against the bundled catalog and deduplicated. Opening study without a valid nonempty setup SHALL return to selection without creating a round.

The study screen SHALL provide Change selection; it and back navigation SHALL end the current in-memory round and return to the preserved selection. Backgrounding and foregrounding the app while its process survives SHALL retain the round. Reloading the web page or restarting the process SHALL NOT restore free-practice answers, scores, or mistake-review history; a valid free-practice setup SHALL start a fresh round, otherwise selection SHALL open. Session results SHALL be transient and this behavior SHALL be explained on the study screen. The separately specified spaced-repetition capability SHALL provide a scheduled entry alongside free practice and persist its accepted reviews; scheduled eligibility and completion actions follow that capability rather than the free-practice shuffle/repeat rules here.

#### Scenario: Open an invalid study link

- **WHEN** `/study` is opened without setup or with only unknown family identities
- **THEN** the learner returns to selection and no empty round is rendered

#### Scenario: Leave and resume selection

- **WHEN** the learner leaves a partially answered round through back or Change selection
- **THEN** the prior family selection remains available and the partial score is discarded

#### Scenario: Background versus restart

- **WHEN** the app goes to the background and returns without process termination
- **THEN** the current prompt, input, and score remain intact
- **AND** a later full restart or web reload does not restore the previous score

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
- **AND** after grading, Next or Show results replaces Check answer as the filled primary action

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
