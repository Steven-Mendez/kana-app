## ADDED Requirements

### Requirement: Rounds answer by touch or by keyboard

Study SHALL resolve an input mode. On web with a fine pointer and a viewport at least 768 logical pixels wide the mode SHALL be `keyboard`; everywhere else it SHALL be `touch`. On web, the first physical key press of a printable character SHALL switch the current round to `keyboard`. The `keyboard` mode SHALL keep the existing typing flow. The `touch` mode SHALL NOT mount a text input or open the software keyboard.

#### Scenario: Phone

- **WHEN** a learner starts a round on iOS, Android or a narrow web viewport
- **THEN** the prompt is answered with coins and no software keyboard opens

#### Scenario: Desktop web

- **WHEN** a learner starts a round on desktop web with a mouse
- **THEN** the rōmaji input is focused and the typing behaviour is unchanged

### Requirement: Touch answers use three coins

In `touch` mode each prompt SHALL offer three rōmaji coins in random order: the card's canonical reading and two different canonical readings from other cards of the same alphabet. Distractors SHALL prefer kana the learner has confused with the prompt, then the other kana of the round, then cards of the same family category, and SHALL never repeat a reading. Selecting a coin SHALL mark it selected without grading. Check SHALL grade the selected reading through the same grading rules as typing and SHALL be disabled until a coin is selected. Skip SHALL reveal the answer and count the card as incorrect, like Reveal answer.

After grading, the chosen coin SHALL show correct or wrong, the correct coin SHALL be highlighted, the others SHALL dim and the kana card SHALL be stamped (correct) or flipped to its back (wrong). A feedback ribbon SHALL replace the answer actions. Correct answers SHALL advance automatically after about 900 milliseconds or immediately on Continue; wrong or skipped answers SHALL wait for Continue. Scheduled rounds SHALL keep Continue unavailable until the review is saved.

#### Scenario: Choose the right coin

- **WHEN** the learner selects `tsu` for つ and activates Check
- **THEN** one correct grade is recorded, the card is stamped and the ribbon appears
- **AND** the next prompt appears without another tap

#### Scenario: Choose a wrong coin

- **WHEN** the learner selects `shi` for つ and activates Check
- **THEN** one incorrect grade with answer `shi` is recorded, the card flips to show `tsu` and the chosen `shi`
- **AND** the round waits for Continue

#### Scenario: Round kana as distractors

- **GIVEN** a round of い and か with no recorded confusions
- **WHEN** い is prompted in `touch` mode
- **THEN** the coins include `i` and `ka`

### Requirement: Rounds are finite or endless

A round SHALL be either finite or endless. A finite round SHALL end and show results by itself once its 12th graded answer is resolved: after correct feedback ends or Continue is pressed, and for scheduled rounds only after that review is saved. A duel SHALL be a finite round of 8. An endless round SHALL behave as before and end only when the learner finishes. Both lengths SHALL grade, commit and rate every answer exactly as the existing study loop does; the round length SHALL NOT add, skip or change FSRS reviews. The progress bar SHALL show answered/total in finite rounds and stay empty in endless rounds, where the answered count remains in the header.

#### Scenario: Finish a finite round

- **WHEN** the learner resolves the 12th answer of a finite round
- **THEN** results appear without pressing Finish
- **AND** exactly 12 grades are counted

#### Scenario: Scheduled finite round

- **WHEN** the 12th answer of a scheduled finite round is still saving
- **THEN** results wait until it is saved, and a failed save keeps the retry available

### Requirement: Points, combo and grade summarize a round

A round SHALL derive its score only from its immutable grades. The combo SHALL be the number of consecutive correct grades. Each correct grade SHALL earn 10 points multiplied by 1 for combos 1–2, 1.5 for 3–5 and 2 for 6 or more, counting the combo including that grade; incorrect and revealed grades SHALL earn nothing and reset the combo. The grade SHALL be S at 95% accuracy or more with no revealed answers, A at 85% or more, B at 70% or more and C otherwise; a round with no graded answers SHALL have no grade. The round time SHALL run from the first prompt to the end of the round.

#### Scenario: Score a mixed round

- **WHEN** grades are correct ×4, incorrect, correct ×2
- **THEN** points are 10 + 10 + 15 + 15 + 0 + 10 + 10 = 70, the best combo is 4 and accuracy is 86%, grade A

### Requirement: The daily streak comes from saved reviews

The daily streak SHALL count consecutive local calendar days that contain at least one saved review event, ending today, or ending yesterday when today has none. Its state SHALL be `active` when today has a saved review, `at-risk` when the streak is positive without one today, and `off` when it is zero. Milestones SHALL be 3, 7, 14, 30, 50, 100 and 365 days. Free practice and practice-only answers that save no review SHALL NOT count.

#### Scenario: Played yesterday

- **WHEN** reviews were saved on each of the last four days except today
- **THEN** the streak is 4 and at risk

#### Scenario: First review of the day

- **WHEN** a scheduled round saves the first review of today after a three-day streak
- **THEN** the streak becomes 4 and results celebrate the extended streak

### Requirement: The board reflects FSRS states

The Home board SHALL show the basic kana of the selected alphabet in gojūon rows. Each tile SHALL be `unseen` when its card has no saved repetition, `mastered` when its FSRS state is Review, and `learning` otherwise, with a partial bar of its stability relative to 21 days. The board SHALL only read saved progress and SHALL NOT write.

#### Scenario: Mixed progress

- **WHEN** あ is in Review, い in Learning and う has never been reviewed
- **THEN** あ is gold, い shows a partial bar and う shows as unseen

### Requirement: Confusions are recorded locally and drive duels

When an answer is graded incorrect and its submitted text is an accepted reading of another card in the same alphabet, the app SHALL record a confusion between the two cards. Revealed answers and text that spells no kana SHALL NOT be recorded. Confusions SHALL be stored per account in their own local document, separate from review events, the learning document and cloud sync, tagged with the learning document generation; a different generation SHALL read as empty and its next write SHALL start a fresh document. A failed write SHALL NOT affect grading or saving reviews.

The most confused pair SHALL be the pair with the highest count of at least 2, the most recent winning ties. Home SHALL offer it as a duel that starts a finite free-practice round of 8 with exactly those two kana; without such a pair Home SHALL explain how a duel appears.

#### Scenario: Record a confusion

- **WHEN** the learner answers `shi` for つ
- **THEN** a confusion between つ and し is recorded once
- **AND** answering `xyz` or revealing records nothing

#### Scenario: Start a duel

- **WHEN** つ and し have been confused twice
- **THEN** Home shows つ VS し and Challenge starts a free round of 8 with only those two kana

#### Scenario: Reset progress

- **WHEN** the learner resets progress
- **THEN** previous confusions no longer appear and no duel is offered
