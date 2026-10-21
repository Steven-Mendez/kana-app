## ADDED Requirements

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

The home screen SHALL offer Hiragana and Katakana views, three labeled catalog sections, and independently selectable families showing kana with canonical rōmaji. A family toggle SHALL include or exclude its entire family. Switching the visible alphabet SHALL retain both alphabets' selections. Select all and Clear all SHALL affect only the visible alphabet. The screen SHALL show the selected-card count for each alphabet and the combined total used by Start study.

On first use, the application SHALL show Hiragana with only its five vowels selected and no katakana selected. A zero-card selection SHALL disable Start study and display an instruction to select at least one family.

#### Scenario: First study session

- **WHEN** a learner opens the home screen without saved preferences
- **THEN** あ, い, う, え, and お are selected as one family
- **AND** Start study indicates five cards

#### Scenario: Mixed selection

- **WHEN** the learner selects hiragana vowels, switches to Katakana, and selects katakana vowels
- **THEN** the selection contains five hiragana and five katakana cards
- **AND** starting study includes all ten cards regardless of the visible alphabet

#### Scenario: Bulk actions are scoped to the visible alphabet

- **WHEN** the learner uses Select all and then Clear all while viewing Katakana
- **THEN** the katakana count changes to 107 and then zero
- **AND** the hiragana selection is unaffected

#### Scenario: Empty selection

- **WHEN** both alphabets have no selected families
- **THEN** Start study is disabled and the learner is told to select a family

### Requirement: Selection preferences survive reopening

The application SHALL save selected family identities and the last visible alphabet locally and restore them before enabling study. A deliberately empty saved selection SHALL remain empty. Unknown or duplicate family identities SHALL be removed when restoring; malformed or unreadable preferences SHALL fall back to the first-use selection. Storage failure SHALL leave study usable in memory and display a non-blocking notice that preferences could not be restored or saved. Initial rendering SHALL NOT overwrite stored preferences before restoration completes.

#### Scenario: Restore a customized selection

- **WHEN** the learner reopens the app after selecting families in both alphabets
- **THEN** those selections and the last visible alphabet are restored
- **AND** starting a round uses the restored selection

#### Scenario: Restore an intentionally empty selection

- **WHEN** valid saved preferences contain no selected families
- **THEN** the selection stays empty and Start study stays disabled

#### Scenario: Handle stale or invalid preferences

- **WHEN** saved preferences include known, unknown, and duplicate family identities
- **THEN** only distinct known identities are restored
- **AND** malformed data or a failed read instead uses the first-use selection with a notice

#### Scenario: A save fails

- **WHEN** local storage rejects a preference write
- **THEN** the learner can continue selecting and studying with the current in-memory selection
- **AND** the screen does not claim that the preferences were saved

### Requirement: A study round presents the selected cards once

Starting study SHALL snapshot the selected cards, shuffle their order, and show each card exactly once in that round. The study screen SHALL show one large kana prompt, its alphabet, a rōmaji input, answer actions, answered/total progress, and the running correct-answer count. The answer SHALL be hidden until the card is graded or revealed. A yōon combination SHALL count as one card. A round containing a single card SHALL be valid.

The input SHALL accept Latin text without automatic capitalization or correction. Check answer and the keyboard submit action SHALL grade the answer only on explicit submission; typing alone SHALL NOT grade or advance. Blank or whitespace-only submission SHALL leave the card ungraded and show an instruction to enter an answer or reveal it.

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

A correct submission SHALL show correct feedback and the canonical reading. An incorrect submission SHALL show incorrect feedback, the submitted answer, and the canonical reading, and add the card to the round's mistakes. Reveal answer SHALL show the canonical reading and count the card as incorrect, including when the input is empty. Feedback SHALL remain until the learner activates Next; the last card SHALL instead offer Show results.

Once graded or revealed, a card SHALL NOT accept further grading or change its result. Repeated taps or keyboard events SHALL NOT score it twice or skip the next ungraded card. Next SHALL clear the input and feedback for the next card. Feedback SHALL use text or symbols as well as color.

#### Scenario: Correct answer

- **WHEN** the learner submits `a` for ア
- **THEN** correct feedback is shown and both answered and correct counts increase by one
- **AND** the prompt remains visible until Next is activated

#### Scenario: Incorrect or revealed answer

- **WHEN** the learner submits `ka` for う or uses Reveal answer
- **THEN** `u` is shown, answered increases by one, and correct does not increase
- **AND** う is included once in the round's mistakes

#### Scenario: Duplicate submission

- **WHEN** Check answer is activated twice on a card already graded
- **THEN** only its first result is counted and the next card remains unanswered

### Requirement: Results support focused mistake review

After every card is resolved and Show results is activated, the application SHALL show the round's total, correct and incorrect counts, and accuracy rounded to the nearest integer percentage. It SHALL list each missed card with its alphabet and canonical reading. Accuracy SHALL equal correct divided by total times 100; revealed cards SHALL count as incorrect.

The summary SHALL offer Repeat selection and Change selection, plus Review mistakes when mistakes exist. Repeat selection SHALL start a newly shuffled round using the original selection snapshot, including when invoked after review. Review mistakes SHALL start a newly shuffled round containing only the distinct mistakes from the just-finished round, with fresh counters and the same checking rules. Review SHALL NOT alter saved family selections or retroactively change a completed round's score.

#### Scenario: Complete a round with mistakes

- **WHEN** a five-card round finishes with three correct answers, one incorrect answer, and one revealed answer
- **THEN** the summary shows 3 correct, 2 incorrect, and 60% accuracy
- **AND** Review mistakes starts a two-card round at 0/2 answered

#### Scenario: Complete a perfect round

- **WHEN** every card in a round is answered correctly
- **THEN** the summary shows 100% accuracy and a no-mistakes message
- **AND** Review mistakes is unavailable

#### Scenario: Repeat after reviewing mistakes

- **WHEN** the learner finishes a two-card review from an original ten-card selection and chooses Repeat selection
- **THEN** a fresh ten-card round starts with reset counters
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

Selection SHALL present a compact title and instruction, one Hiragana/Katakana selector with per-alphabet counts, one set of bulk actions, and the three labeled family sections in a vertically scrolling column. Each family SHALL be one selectable row containing aligned kana/rōmaji previews. The combined count and Start study SHALL occupy a simple bottom action area; content SHALL reserve enough space that it does not cover any family. On wide screens selection SHALL remain centered and no wider than 896 logical pixels; phone side gutters SHALL be at least 16 logical pixels.

Study SHALL prioritize a large kana prompt above a centered, underlined rōmaji input, feedback, and the current primary action. Progress and correct count SHALL remain compact and subordinate to the prompt. The input placeholder SHALL NOT disclose the answer. Results SHALL use a concise text summary and a plain list of mistakes, with Review mistakes primary when available and Repeat selection primary otherwise.

The study input SHALL be no wider than 192 logical pixels. Answer actions SHALL be compact and content-width, with the secondary reveal action alongside the primary action when space allows. The unanswered state SHALL avoid repeated instructional copy beneath the input; whitespace and the kana itself SHALL dominate the composition. The transient-round explanation SHALL be a short footer sentence.

The study surface SHALL NOT add guided-path navigation, lesson locks, streaks, timers, mastery indicators, historical-statistics panels, authentication controls, theme/audio controls, or preset-chip toolbars. The separately specified app navigation and preferences add navigation around selection and dedicated Profile/Settings screens; global navigation SHALL remain hidden during study and results.

#### Scenario: Minimal selection on a phone

- **WHEN** the learner opens selection at a 390-logical-pixel width
- **THEN** there is one alphabet selector and each family is a whole-row control with readable kana/rōmaji pairs
- **AND** the start area stays above the safe-area inset without obscuring the final family
- **AND** guided-path, mastery, and historical-statistics controls are absent

#### Scenario: Focused study on a wide screen

- **WHEN** study is shown on a desktop-width viewport
- **THEN** the prompt, input, feedback, and answer actions form a centered column no wider than 512 logical pixels
- **AND** the kana has stronger visual emphasis than the progress and correct-count labels

#### Scenario: Simplified results

- **WHEN** the round finishes with mistakes
- **THEN** accuracy and correct/incorrect totals appear above a plain mistakes list
- **AND** Review mistakes is the only filled primary action, with Repeat selection and Change selection secondary

### Requirement: The study loop is accessible and locally available

The selection, study, and results screens SHALL work on iOS, Android, and web. Installed native apps and already-loaded web pages SHALL support the complete loop without network connectivity or account sign-in. The application SHALL NOT require a backend response to select cards, validate answers, or review mistakes.

At a 320-logical-pixel viewport, content SHALL fit without horizontal scrolling and primary actions SHALL remain reachable with the software keyboard open. Interactive targets SHALL be at least 44 by 44 logical pixels. Controls SHALL expose accessible names, selected/disabled states, and visible keyboard focus on web. Feedback SHALL be announced accessibly. Screen-reader prompt labels SHALL identify the alphabet and kana without adding a hidden rōmaji answer before grading. Enlarged system text SHALL remain readable without hiding actions.

#### Scenario: Study offline

- **WHEN** connectivity is lost after the web app loads or while using the installed native app
- **THEN** selection, answering, results, and mistake review remain usable

#### Scenario: Use a narrow screen with the keyboard open

- **WHEN** the learner studies at 320 logical pixels wide with the software keyboard visible
- **THEN** the prompt, input, feedback, and current primary action can be reached without horizontal scrolling

#### Scenario: Use assistive technology or a hardware keyboard

- **WHEN** a learner selects a family or submits an answer using a screen reader or hardware keyboard
- **THEN** selection states, grading feedback, and progress are accessible
- **AND** keyboard submission grades only the current ungraded card and explicit Next advances it
