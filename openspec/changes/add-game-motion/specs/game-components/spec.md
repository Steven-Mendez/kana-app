## ADDED Requirements

### Requirement: Lit flames are alive

A lit `Flame` (the `streak` and `kitsunebi` tones) SHALL be able to sway and flicker continuously from its base. `StreakBadge` in the `active` and `milestone` states, the combo badge and the profile streak SHALL use the live flame. `pending` and `off` flames SHALL NOT sway.

#### Scenario: Active streak

- **WHEN** a `StreakBadge` is `active`
- **THEN** its flame sways and stretches slightly in a loop, anchored at its base

#### Scenario: Streak off

- **WHEN** a `StreakBadge` is `off`
- **THEN** its flame stays still

### Requirement: Streak ignites when extended

`StreakBadge` SHALL accept an `ignite` flag. When set, the flame SHALL pop in with an overshoot, sparks SHALL burst out of it and fade, and the day count SHALL bump. The results screen SHALL ignite the badge when the round extended the daily streak.

#### Scenario: Round keeps the streak

- **WHEN** a round extends the streak to 4 days and results appear
- **THEN** the streak panel enters after the grade stamp and its flame ignites with sparks around it

### Requirement: Combos pop

The combo badge on `KanaCard` SHALL pop each time the combo grows, and each new kitsunebi at the head of `AnimatedProgressBar` SHALL pop in when it is lit.

#### Scenario: Combo grows

- **WHEN** the combo goes from 3 to 4
- **THEN** the `×4` badge scales up past its size and settles

### Requirement: Correct feedback lands in place

A correct hero card SHALL hop briefly while its stamp lands from just above its size and becomes opaque at once. `FeedbackBottomSheet` SHALL enter with a short rise of a few pixels, not a slide from the screen edge, and its mascot SHALL pop from a partial scale. In touch rounds the ribbon SHALL stay until the learner presses Continue.

#### Scenario: Correct coin

- **WHEN** the learner checks the correct coin
- **THEN** the card hops, the stamp lands and the ribbon rises into place within about 300ms
- **AND** the ribbon stays until Continue is pressed

### Requirement: Results play in sequence

The results screen SHALL reveal the grade stamp first, then the streak celebration and then each score, one after another, with short entrance animations.

#### Scenario: Results appear

- **WHEN** a round ends
- **THEN** the scores rise into place one after another after the grade lands

### Requirement: Meters fill

`Meter` SHALL fill from empty to its value when it first appears and animate to a new value when it changes.

#### Scenario: Home meter

- **WHEN** Home shows a meter at 40%
- **THEN** the fill grows from 0 to 40%

### Requirement: Prompts deal in

Each new hero prompt SHALL rise and settle into place, and its rōmaji coins SHALL pop in one after another with a shared stagger. A wrong hero card SHALL shake briefly after flipping. The feedback mascot SHALL hop for a correct answer and shake for a wrong one, and the ribbon title SHALL pop in.

#### Scenario: Next prompt

- **WHEN** the learner continues to the next kana
- **THEN** the card rises into place and the coins pop in left to right

### Requirement: Spark bursts celebrate

`Burst` SHALL throw gold sparks out of its parent once and fade them. The combo badge SHALL burst when a combo lights a new kitsunebi (multiples of 3) and the results grade stamp SHALL burst as it slams down, with more sparks for grade S.

#### Scenario: Combo of six

- **WHEN** the combo reaches 6
- **THEN** sparks burst from the `×6` badge

### Requirement: Shared motion tokens

Game motion SHALL use the shared curve, springs, durations and stagger from `src/lib/motion.ts`. Home sections SHALL rise into place in reading order once when progress loads.

#### Scenario: Home loads

- **WHEN** Home shows today's round and progress
- **THEN** the round panel and each section rise in, one stagger step apart

### Requirement: New motion respects reduced motion

The live flame, ignition, sparks, combo pops, results sequence and meter fill SHALL run on the UI thread through Reanimated and SHALL show their final still state immediately when reduce motion is on.

#### Scenario: Reduced motion

- **WHEN** reduce motion is on and the streak is extended
- **THEN** the badge shows its lit flame and count without sway, pop or sparks
