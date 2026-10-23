## MODIFIED Requirements

### Requirement: Progress reflects saved scheduling data

Home, Kana and Profile SHALL derive counts from saved mastery progress. Studied coverage SHALL count kana with at least one saved answer, separately per alphabet. Due SHALL count studied kana whose due time is at or before now; unseen kana SHALL remain separate. Profile SHALL show To discover, Learning and Mastered stages, total saved answers, and unique kana last answered on the current local day, with explicit local-only and coverage explanations. Views SHALL refresh on focus, foreground, manual retry, and at least every minute while focused. No writes SHALL occur when viewing progress.

#### Scenario: Due boundary and lifecycle

- **WHEN** a studied kana becomes due or the learner returns from study
- **THEN** refreshed indicators reflect the current absolute due instant and saved level
- **AND** kana due later and unseen kana are not counted as due

#### Scenario: Review pending kana

- **WHEN** the learner starts the due-only action from Home
- **THEN** only the snapshot of due studied kana is eligible, rechecked when study begins; that pool remains repeatable until explicit finish
- **AND** unseen kana or kana due later in the same families are not introduced

#### Scenario: No saved reviews

- **WHEN** Profile opens on a new installation
- **THEN** it explains that statistics appear after the first answer and offers Start practicing, without zero tiles, an all-unseen bar or a streak

### Requirement: Progress colours carry meaning

Alphabet coverage SHALL use the same primary accent for both alphabets' bars, with neutral glyphs and percentages; the success colour SHALL NOT distinguish alphabets. Stage bars SHALL use a neutral fill for unseen kana, success for mastered kana, and primary for learning. Kana tiles SHALL use a gold tint for mastered kana and the tangerine bar for learning. Empty bars SHALL show only their muted track.

#### Scenario: Fresh installation

- **WHEN** Profile opens with no saved answers
- **THEN** it shows a short explanation and a Start practicing action instead of zero statistics and a full unseen bar
- **AND** Home shows both alphabets with empty muted tracks rather than primary or error colours
