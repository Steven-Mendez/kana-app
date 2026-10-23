## ADDED Requirements

### Requirement: Game pieces press into a solid edge

Interactive game pieces SHALL render an ink-outlined face over a solid edge of their variant color. On press-in the face SHALL move down by the edge depth and the edge SHALL be hidden; on release it SHALL return. Disabled pieces SHALL render without edge, SHALL NOT respond and SHALL expose the disabled state to assistive technology.

#### Scenario: Press a game button

- **WHEN** the learner presses a primary `GameButton`
- **THEN** the face moves down 5px within about 90ms and a light impact haptic fires on supported devices
- **AND** releasing triggers the button action

#### Scenario: Disabled button

- **WHEN** a `GameButton` is disabled
- **THEN** it uses the locked colors without an edge, ignores presses and reports `disabled`

### Requirement: Game button variants

`GameButton` SHALL offer `primary`, `secondary`, `success`, `danger` and `outline` variants plus a disabled state, in `md` (54px) and `lg` (60px) sizes, as a capsule with a display-font label. It SHALL expose the button role and accept full-width layout.

#### Scenario: Render every variant

- **WHEN** each variant is rendered with a label
- **THEN** each shows its face, edge and label colors from the theme and is reachable as a button with that label

### Requirement: Kana card shows the result on the card

`KanaCard` SHALL render a kana as a `hero` prompt or an `option`. Options SHALL support `default`, `selected`, `correct`, `wrong` and `dimmed`. A correct card SHALL show a vermilion stamp and the reading; a wrong card SHALL flip to a sumi back showing the kana, its reading and, when given, what the learner chose. With a combo of 3 or more the card SHALL show a kitsunebi halo and a `×N` badge.

#### Scenario: Correct answer

- **WHEN** a hero card switches to `correct` with reading `tsu`
- **THEN** a stamp appears over the kana with a short scale animation and the label `tsu` appears
- **AND** assistive technology announces the correct reading

#### Scenario: Wrong answer

- **WHEN** a hero card switches to `wrong` with reading `tsu` and chosen `shi`
- **THEN** the card flips to its back with つ, `tsu` and the chosen reading
- **AND** assistive technology announces the wrong answer and the correct reading

#### Scenario: Selected option

- **WHEN** an option card is selected
- **THEN** it rises and uses the ai colors and reports the selected state

### Requirement: Romaji options are touch coins

`RomajiOptionPill` SHALL render a rōmaji reading as an 84px circular coin with `default`, `selected`, `correct`, `wrong`, `dimmed` and `used` states and an optional keyboard shortcut hint. A `used` coin SHALL keep its footprint and SHALL NOT respond.

#### Scenario: Choose a coin

- **WHEN** the learner presses the `tsu` coin
- **THEN** `onPress` runs and the coin can be shown as selected
- **AND** the coin is announced as a button labelled `tsu`

### Requirement: Progress bar with kitsunebi combo

`AnimatedProgressBar` SHALL show round progress from 0 to 1 in an outlined capsule, animate increases with a spring, never render a smaller value than the highest it has shown in the same round, and show 1, 2 or 3 kitsunebi flames at the fill head for combos of 3, 6 and 9 or more. It SHALL expose a progress bar value and a quit button.

#### Scenario: Combo grows

- **WHEN** combo goes from 2 to 6
- **THEN** two kitsunebi flames appear at the head of the fill

#### Scenario: Quit

- **WHEN** the learner presses the quit button
- **THEN** `onQuit` runs

### Requirement: Streak badge

`StreakBadge` SHALL show the number of streak days with a flame in `active`, `at-risk`, `off` and `milestone` states and a complete accessibility label. It SHALL only be given real streak data by its callers.

#### Scenario: Streak at risk

- **WHEN** the badge is `at-risk` with 32 days
- **THEN** it shows 32 with an outlined flicking flame and the label tells the learner to play today to keep it

### Requirement: Feedback ribbon with the mascot

`FeedbackBottomSheet` SHALL render as the bottom of a round screen, not as a modal, in `correct` (gold) and `wrong` (sumi) tones, with the kitsune mascot, a title, an optional message and one primary continue action. It SHALL slide in, announce its title and fire a success or error haptic when shown.

#### Scenario: Show wrong feedback

- **WHEN** the ribbon appears with tone `wrong`, title `Era tsu` and action `Entendido`
- **THEN** it slides up with the mascot, an error haptic fires and the title is announced as an alert
- **AND** pressing `Entendido` runs `onContinue`

### Requirement: Game motion respects reduced motion

All game components SHALL keep motion on the UI thread through Reanimated and SHALL replace pops, stamps, flips, slides, flicker and rises with immediate state changes when the system reduce-motion setting is on.

#### Scenario: Reduced motion

- **WHEN** reduce motion is enabled and a card becomes `wrong`
- **THEN** the back of the card appears without the flip animation
