## MODIFIED Requirements

### Requirement: Progress reflects saved scheduling data

Dashboard and Progress SHALL derive counts from the active account’s local FSRS cards, including reconciled remote events. Reviewed coverage SHALL count cards with reps greater than zero, separately per alphabet. Due SHALL count reviewed cards with due time at or before now; unseen cards SHALL remain separate. Progress SHALL show learning/relearning/review stages, total saved reviews, and unique kana last reviewed on the current local day, with explicit account-scope and coverage explanations. Views SHALL refresh on focus, foreground, manual retry/refresh, and at least every minute while focused. Rendering statistics SHALL NOT create study events. Account synchronization MAY update the local repository independently.

#### Scenario: Due boundary and lifecycle

- **WHEN** a saved card becomes due or the learner returns from study
- **THEN** refreshed indicators reflect the current absolute due instant and saved state
- **AND** future-due and unseen cards are not counted as due

#### Scenario: Review pending kana

- **WHEN** the learner starts the due-only action
- **THEN** only the snapshot of due reviewed kana is eligible, rechecked by scheduled study
- **AND** new or future-due kana in the same families are not introduced

#### Scenario: No saved reviews

- **WHEN** Progress opens on a new installation
- **THEN** it shows zero reviewed, zero due, the entire catalog as unseen, and a working practice action
