## MODIFIED Requirements

### Requirement: The board reflects FSRS states

Each kana tile on the Kana screen SHALL be `unseen` when its kana has no saved answer, `mastered` when its mastery level is 100%, and `learning` otherwise, with a bar filled to its mastery level. The board SHALL only read saved progress and SHALL NOT write. The kana sheet SHALL show the level of a studied kana and, when it reached today's maximum, that it can grow again tomorrow.

#### Scenario: Mixed progress

- **WHEN** あ is at 100%, い at 45% and う has never been answered
- **THEN** あ is gold, い shows a bar at 45% and う shows as unseen
