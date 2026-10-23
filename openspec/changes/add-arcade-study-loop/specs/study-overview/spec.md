## MODIFIED Requirements

### Requirement: Home connects the learning journey

Home SHALL show a responsive game hub with a direct action to resume the saved selection, a choice between a finite round of 12 and an endless round, links to alphabet exploration, and due-review access. Empty selection SHALL lead to configuration. Data-dependent actions SHALL remain unavailable until progress loads. Loading and retryable errors SHALL be distinct from a first-use state. Home SHALL NOT show the daily encouragement/local-progress announcement banner. Home SHALL NOT invent identities, streaks, points or mastery: the streak badge SHALL come from saved reviews, the board from saved FSRS states and the duel from recorded confusions, and Home SHALL NOT show points. App branding SHALL reuse the existing fox logo in `assets/icon.png`, including the web header, native Home header, and Profile; it SHALL NOT adopt the reference brand.

#### Scenario: Resume saved selection

- **WHEN** a learner starts from Home with saved individual kana and the default finite length
- **THEN** scheduled study receives exactly those kana and a round length of 12 without replacing the saved selection
- **AND** closing study returns to Practice with that selection

#### Scenario: Choose an endless round

- **WHEN** the learner chooses the endless length and starts
- **THEN** scheduled study starts with no round length

#### Scenario: First use or unavailable data

- **WHEN** no reviews have been saved
- **THEN** the board shows every kana as unseen with an invitation to begin and no streak is claimed
- **AND** a failed read instead shows an error and retry without claiming zero progress
