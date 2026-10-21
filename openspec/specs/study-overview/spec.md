# study-overview Specification

## Purpose

TBD - created by archiving change adopt-stitch-study-experience. Update Purpose after archive.

## Requirements

### Requirement: Home connects the learning journey

Home SHALL show a warm, responsive dashboard with a direct action to resume the saved selection, links to alphabet exploration, and due-review access. Empty selection SHALL lead to configuration. Data-dependent actions SHALL remain unavailable until progress loads. Loading and retryable errors SHALL be distinct from a first-use state. Home SHALL NOT show the daily encouragement/local-progress announcement banner. Home SHALL NOT invent identities, streaks, XP, or mastery. App branding SHALL reuse the existing fox logo in `assets/icon.png`, including the web header, native Home header, and Profile; it SHALL NOT adopt the reference brand.

#### Scenario: Resume saved selection

- **WHEN** a learner starts from Home with saved individual kana
- **THEN** scheduled study receives exactly those kana without replacing the saved selection
- **AND** closing study returns to Practice with that selection

#### Scenario: First use or unavailable data

- **WHEN** no reviews have been saved
- **THEN** coverage and review counts are zero with an invitation to begin
- **AND** a failed read instead shows an error and retry without claiming zero progress

### Requirement: Syllabary supports exploration independently of selection

Syllabary SHALL expose both alphabets and basic, voiced, and yōon categories. Basic rows SHALL align to A/I/U/E/O with missing vowel positions preserved; yōon SHALL use A/U/O. At enlarged text, cells SHALL reflow. Tapping a kana SHALL show its canonical reading, aliases when present, and a clearly labeled action to configure its family. Browsing alone SHALL NOT change the saved study selection.

#### Scenario: Explore then practice a family

- **WHEN** a learner inspects a katakana kana and activates Practice this family
- **THEN** the app replaces the selection with that kana's full family and opens Practice
- **AND** ordinary alphabet/category changes do not mutate saved selection

### Requirement: Progress reflects saved scheduling data

Dashboard and Progress SHALL derive counts from existing local FSRS cards. Reviewed coverage SHALL count cards with reps greater than zero, separately per alphabet. Due SHALL count reviewed cards with due time at or before now; unseen cards SHALL remain separate. Progress SHALL show learning/relearning/review stages, total saved reviews, and unique kana last reviewed on the current local day, with explicit local-only and coverage explanations. Views SHALL refresh on focus, foreground, manual retry/refresh, and at least every minute while focused. No writes SHALL occur when viewing progress.

#### Scenario: Due boundary and lifecycle

- **WHEN** a saved card becomes due or the learner returns from study
- **THEN** refreshed indicators reflect the current absolute due instant and saved state
- **AND** future-due and unseen cards are not counted as due

#### Scenario: Review pending kana

- **WHEN** the learner starts the due-only action
- **THEN** only the snapshot of due reviewed kana is eligible, rechecked when study begins; that pool remains repeatable until explicit finish
- **AND** new or future-due kana in the same families are not introduced

#### Scenario: No saved reviews

- **WHEN** Progress opens on a new installation
- **THEN** it shows zero reviewed, zero due, the entire catalog as unseen, and a working practice action
