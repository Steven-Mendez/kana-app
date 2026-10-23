## MODIFIED Requirements

### Requirement: Home connects the learning journey

Home SHALL show a responsive game hub led by one main action: today's round with the saved selection, a choice between a finite round of 12 and an endless round, and a link to change the selection on Kana. Above it Home SHALL greet the learner with one quiet unboxed line in body type, so the round title remains the only hero. Below it Home SHALL show today's goal of 5 kana reviewed, measured from saved reviews of the current local day; due review once at least one review is saved; the duel, which until a confused pair exists is a locked teaser explaining how a duel appears; and both alphabets' reviewed coverage with a link to Kana. Empty selection SHALL lead to Kana. Data-dependent sections SHALL remain unavailable until progress loads. Loading and retryable errors SHALL be distinct from a first-use state. Home SHALL NOT show the daily encouragement/local-progress announcement banner or the kana board. Home SHALL NOT invent identities, streaks, points or mastery: the streak badge SHALL come from saved reviews, the goal and coverage from saved FSRS cards, and the duel from recorded confusions, and Home SHALL NOT show points. App branding SHALL reuse the existing fox logo in `assets/icon.png`; it SHALL NOT adopt the reference brand.

#### Scenario: Resume saved selection

- **WHEN** a learner starts from Home with saved individual kana and the default finite length
- **THEN** scheduled study receives exactly those kana and a round length of 12 without replacing the saved selection
- **AND** closing study returns to Kana with that selection

#### Scenario: Choose an endless round

- **WHEN** the learner chooses the endless length and starts
- **THEN** scheduled study starts with no round length

#### Scenario: First use or unavailable data

- **WHEN** no reviews have been saved
- **THEN** Home shows the round with first-use wording, a goal at zero, a locked duel, zero coverage, no due panel and no streak claimed
- **AND** a failed read instead shows an error and retry without claiming zero progress

### Requirement: Syllabary supports exploration independently of selection

The Kana screen SHALL expose both alphabets and basic, voiced, and yōon categories. Basic rows SHALL align to A/I/U/E/O with missing vowel positions preserved; yōon SHALL use A/U/O. At enlarged text, tiles SHALL reflow. Each tile SHALL show the kana, its canonical reading and its saved state: unseen, learning with a partial stability bar, or mastered, derived from saved FSRS cards without writing. Tapping a kana SHALL open a detail sheet with its stroke order, canonical reading, aliases when present, an action to add it to or remove it from the selection, and a clearly labeled action to practice only its family. Opening, browsing and closing the sheet SHALL NOT change the saved study selection.

#### Scenario: Explore then practice a family

- **WHEN** a learner opens katakana シ and activates Practice this family
- **THEN** the selection is replaced with シ's full family and a scheduled round of that family starts
- **AND** ordinary alphabet/category changes and opening the sheet do not mutate saved selection

#### Scenario: Tile states

- **WHEN** あ has a saved learning card and い has none
- **THEN** あ is labeled learning with a partial bar and い is labeled unseen

### Requirement: Progress reflects saved scheduling data

Home, Kana and Profile SHALL derive counts from existing local FSRS cards. Reviewed coverage SHALL count cards with reps greater than zero, separately per alphabet. Due SHALL count reviewed cards with due time at or before now; unseen cards SHALL remain separate. Profile SHALL show learning/relearning/review stages, total saved reviews, and unique kana last reviewed on the current local day, with explicit local-only and coverage explanations. Views SHALL refresh on focus, foreground, manual retry, and at least every minute while focused. No writes SHALL occur when viewing progress.

#### Scenario: Due boundary and lifecycle

- **WHEN** a saved card becomes due or the learner returns from study
- **THEN** refreshed indicators reflect the current absolute due instant and saved state
- **AND** future-due and unseen cards are not counted as due

#### Scenario: Review pending kana

- **WHEN** the learner starts the due-only action from Home
- **THEN** only the snapshot of due reviewed kana is eligible, rechecked when study begins; that pool remains repeatable until explicit finish
- **AND** new or future-due kana in the same families are not introduced

#### Scenario: No saved reviews

- **WHEN** Profile opens on a new installation
- **THEN** it explains that statistics appear after the first review and offers Start practicing, without zero tiles, an all-unseen bar or a streak

### Requirement: Progress colours carry meaning

Alphabet coverage SHALL use the same primary accent for both alphabets' bars, with neutral glyphs and percentages; the success colour SHALL NOT distinguish alphabets. Memory-stage bars SHALL use a neutral fill for unseen kana, success for kana in review, and primary for learning and relearning. Kana tiles SHALL use a gold tint for mastered kana and the tangerine bar for learning. Empty bars SHALL show only their muted track.

#### Scenario: Fresh installation

- **WHEN** Profile opens with no saved reviews
- **THEN** it shows a short explanation and a Start practicing action instead of zero statistics and a full unseen bar
- **AND** Home shows both alphabets with empty muted tracks rather than primary or error colours

### Requirement: Syllabary shows stroke order

The Kana detail sheet SHALL show the selected kana as a stroke-order diagram on iOS, Android and web. Strokes SHALL appear one at a time in their writing order, the newest stroke SHALL use the primary accent until all are drawn, pending strokes SHALL remain visible as a faint outline, and each drawn stroke SHALL carry its order number at its starting point. Yōon SHALL show both glyphs side by side with numbering continuing across them. Opening another kana SHALL restart the animation, and an accessible Replay strokes action of at least 44 logical pixels SHALL restart it on demand. When the system requests reduced motion, the finished numbered diagram SHALL appear immediately. The diagram SHALL expose the kana and its stroke count to assistive technology.

Stroke data SHALL ship with the app for every catalogue glyph, work offline, and keep upstream attribution and licence notices. If a glyph has no data, the sheet SHALL fall back to the static glyph.

#### Scenario: Inspect a basic kana

- **WHEN** the learner taps あ on Kana
- **THEN** its three strokes are drawn in order with numbers 1 to 3
- **AND** Replay strokes draws them again from the first stroke

#### Scenario: Inspect a yōon

- **WHEN** the learner taps きゃ
- **THEN** き and ゃ are shown side by side and stroke numbers continue from き into ゃ

#### Scenario: Reduced motion

- **WHEN** reduced motion is enabled
- **THEN** the complete numbered diagram appears without stepping through strokes
