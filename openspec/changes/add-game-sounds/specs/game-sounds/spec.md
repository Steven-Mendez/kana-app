## ADDED Requirements

### Requirement: Graded answers and combos play a sound

Grading a card SHALL play one sound when the grade is first recorded: a correct sound for a correct grade and a mistake sound for an incorrect or revealed grade. A correct grade that brings the combo to a new kitsunebi (3, 6 or 9 answers in a row) SHALL play the combo sound instead of the correct sound. Duplicate submissions, stale events, Next, retries and save completion SHALL NOT play another sound for that card. Sounds SHALL accompany, never replace, the visible, announced and haptic feedback.

#### Scenario: Correct and incorrect answers

- **WHEN** a learner answers one card correctly and then the next one incorrectly
- **THEN** the correct sound plays once and then the mistake sound plays once

#### Scenario: Combo reaches a new kitsunebi

- **WHEN** a learner answers a third card in a row correctly
- **THEN** the combo sound plays instead of the correct sound

#### Scenario: Repeated events after grading

- **WHEN** Check answer is activated again or Next is pressed for an already graded card
- **THEN** no additional sound plays

### Requirement: Round results celebrate with sound

When the results of a round appear, a completion fanfare SHALL play once, together with the grade stamp; a round without mistakes SHALL play the perfect fanfare instead. When the results also extend the daily streak, the streak sound SHALL play once when the streak flame ignites. Re-rendering the results SHALL NOT replay them.

#### Scenario: Round with mistakes

- **WHEN** a round with at least one mistake ends
- **THEN** the completion fanfare plays once

#### Scenario: Perfect round that extends the streak

- **WHEN** a round without mistakes ends and it is the first saved review of the day
- **THEN** the perfect fanfare plays and then the streak sound plays when the flame ignites

### Requirement: Learners can mute game sounds

Settings SHALL offer a Sound preference with on and off, on by default, stored on the device only. When it is off no game sound SHALL play. On iOS the silent switch, and on Android silent or vibrate ringer modes, SHALL keep game sounds quiet. Game sounds SHALL mix with audio from other apps without pausing it, and SHALL NOT request microphone access or play in the background. Unsupported platforms, blocked autoplay, missing audio hardware or a failed playback SHALL leave the game unchanged.

#### Scenario: Sound turned off

- **WHEN** the learner sets Sound to off and answers a card
- **THEN** no sound plays and the choice is kept after restarting the app

#### Scenario: Playback fails

- **WHEN** the audio player cannot be created or rejects playback
- **THEN** grading, feedback and results behave exactly as without sound
