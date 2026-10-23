## MODIFIED Requirements

### Requirement: Feedback ribbon with the mascot

`FeedbackBottomSheet` SHALL render as the bottom of a round screen, not as a modal, in `correct` (gold) and `wrong` (sumi) tones, with the kitsune mascot, a title, an optional message and one primary continue action. It SHALL slide in and announce its title. It SHALL fire a success or error haptic when shown unless its caller already fired one for the same grade, so each grade produces exactly one haptic. Its continue action SHALL be disableable while a review is still saving.

#### Scenario: Show wrong feedback

- **WHEN** the ribbon appears with tone `wrong`, title `Era tsu` and action `Entendido`
- **THEN** it slides up with the mascot, an error haptic fires and the title is announced as an alert
- **AND** pressing `Entendido` runs `onContinue`

#### Scenario: Caller owns the haptic

- **WHEN** the study screen grades an answer, fires its haptic and then shows the ribbon with the haptic disabled
- **THEN** exactly one haptic fires for that grade
