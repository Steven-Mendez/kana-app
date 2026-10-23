## MODIFIED Requirements

### Requirement: Feedback ribbon with the mascot

`FeedbackBottomSheet` SHALL render as the bottom of a round screen, not as a modal, in `correct` (gold) and `wrong` (sumi) tones, with the kitsune mascot, a title, an optional message and one primary continue action. The mascot SHALL be happy for `correct` and sad (worried brows, wobbly mouth, sweat drop) for `wrong`. It SHALL slide in, announce its title and fire a success or error haptic when shown.

#### Scenario: Show wrong feedback

- **WHEN** the ribbon appears with tone `wrong`, title `Era tsu` and action `Entendido`
- **THEN** it slides up with the sad mascot, an error haptic fires and the title is announced as an alert
- **AND** pressing `Entendido` runs `onContinue`

#### Scenario: Show correct feedback

- **WHEN** the ribbon appears with tone `correct`
- **THEN** it shows the happy mascot
