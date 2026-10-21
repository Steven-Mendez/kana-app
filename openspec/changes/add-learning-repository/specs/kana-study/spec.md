## MODIFIED Requirements

### Requirement: Selection preferences survive reopening

The application SHALL save selected kana identities and the last visible alphabet locally and restore them before enabling study. A deliberately empty saved selection SHALL remain empty. Unknown or duplicate kana identities SHALL be removed when restoring; malformed or unreadable stored documents SHALL produce a recoverable error without replacing them. A failed save SHALL leave the loaded selection usable and display a non-blocking notice. Failed initial restoration SHALL require a successful retry before study. Initial rendering SHALL NOT overwrite stored preferences before restoration completes.

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
- **AND** malformed data or a failed read presents a recoverable error without replacing the saved selection

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
