## ADDED Requirements

### Requirement: Home wording reflects study history

Once progress has loaded, Home's next-step card SHALL use first-use wording when no review has been saved: an invitation to begin and a Start practicing action, without claiming the learner can continue or review. After at least one saved review it SHALL use continue wording and a Start review action. Both actions SHALL start the same scheduled study with the saved selection. An empty selection SHALL keep leading to configuration.

#### Scenario: New learner with the default selection

- **WHEN** a learner with no saved reviews opens Home with あいうえお selected
- **THEN** the card invites them to begin and its action reads Start practicing
- **AND** neither "Pick up where you left off" nor "Start review" is shown

#### Scenario: Returning learner

- **WHEN** at least one review is saved
- **THEN** the card reads "Pick up where you left off" with a Start review action

### Requirement: Progress colours carry meaning

Alphabet coverage SHALL use the same primary accent for both alphabets' glyphs, percentages and bars; the success colour SHALL NOT distinguish alphabets. Progress-stage bars SHALL use a neutral fill for unseen kana, success for kana in review, and primary for learning and relearning. Empty bars SHALL show only their track.

#### Scenario: Fresh installation

- **WHEN** Progress opens with no saved reviews
- **THEN** Hiragana and Katakana both show 0% in the primary accent
- **AND** the full unseen bar uses the neutral fill rather than primary or error colours
