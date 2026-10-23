## MODIFIED Requirements

### Requirement: The board reflects FSRS states

Each kana tile on the Kana screen SHALL be `unseen` when its card has no saved repetition, `mastered` when its FSRS state is Review, and `learning` otherwise, with a partial bar of its stability relative to 21 days. The board SHALL only read saved progress and SHALL NOT write.

#### Scenario: Mixed progress

- **WHEN** あ is in Review, い in Learning and う has never been reviewed
- **THEN** あ is gold, い shows a partial bar and う shows as unseen

### Requirement: Confusions are recorded locally and drive duels

When an answer is graded incorrect and its submitted text is an accepted reading of another card in the same alphabet, the app SHALL record a confusion between the two cards. Revealed answers and text that spells no kana SHALL NOT be recorded. Confusions SHALL be stored per account in their own local document, separate from review events, the learning document and cloud sync, tagged with the learning document generation; a different generation SHALL read as empty and its next write SHALL start a fresh document. A failed write SHALL NOT affect grading or saving reviews.

The most confused pair SHALL be the pair with the highest count of at least 2, the most recent winning ties. Home SHALL offer it as a duel that starts a finite free-practice round of 8 with exactly those two kana; without such a pair Home SHALL show a locked duel that explains how a duel appears.

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
