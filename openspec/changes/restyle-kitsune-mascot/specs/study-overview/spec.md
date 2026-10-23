## MODIFIED Requirements

### Requirement: Home connects the learning journey

Home SHALL show a warm, responsive dashboard with a direct action to resume the saved selection, links to alphabet exploration, and due-review access. Empty selection SHALL lead to configuration. Data-dependent actions SHALL remain unavailable until progress loads. Loading and retryable errors SHALL be distinct from a first-use state. Home SHALL NOT show the daily encouragement/local-progress announcement banner. Home SHALL NOT invent identities, streaks, XP, or mastery. App branding SHALL use the arcade kitsune (ink outline, flat tangerine fur, kitsunebi forehead flame), drawn in the app by the `Kitsune` component and exported to `assets/icon.png` and the other app icons, including the web header, native Home header, and Profile; it SHALL NOT adopt the reference brand.

#### Scenario: Resume saved selection

- **WHEN** a learner starts from Home with saved individual kana
- **THEN** scheduled study receives exactly those kana without replacing the saved selection
- **AND** closing study returns to Practice with that selection

#### Scenario: First use or unavailable data

- **WHEN** no reviews have been saved
- **THEN** coverage and review counts are zero with an invitation to begin
- **AND** a failed read instead shows an error and retry without claiming zero progress

#### Scenario: Arcade branding

- **WHEN** the brand bar, the Home round panel or the app icon is shown
- **THEN** it shows the outlined arcade kitsune, not the soft gradient fox
