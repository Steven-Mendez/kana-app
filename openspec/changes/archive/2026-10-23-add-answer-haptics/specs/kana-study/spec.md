## ADDED Requirements

### Requirement: Graded answers produce haptic feedback

Grading a card SHALL trigger one short haptic signal: a success signal for a correct grade and an error signal for an incorrect or revealed grade. The signal SHALL fire only when the grade is first recorded; duplicate submissions, stale events, alias extensions, Next, retries and save completion SHALL NOT repeat it. Android SHALL use the system haptic feedback constants, iOS SHALL use notification feedback, and web SHALL use the Vibration API when available. Missing hardware, unsupported browsers, disabled system haptics or a rejected haptic call SHALL leave grading, focus and persistence unchanged. Haptics SHALL accompany, never replace, the visible and announced feedback.

#### Scenario: Correct and incorrect answers

- **WHEN** a learner types an accepted reading and later submits a wrong draft
- **THEN** one success haptic and then one error haptic are triggered

#### Scenario: Repeated events after grading

- **WHEN** Check answer is activated twice or Enter continues after a mistake
- **THEN** no additional haptic is triggered for the already graded card

#### Scenario: Haptics unavailable

- **WHEN** the device, browser or system setting cannot produce haptics
- **THEN** grading and feedback behave exactly as without haptics
