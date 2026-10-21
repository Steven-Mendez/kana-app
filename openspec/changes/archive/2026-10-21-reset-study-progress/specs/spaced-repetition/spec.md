## ADDED Requirements

### Requirement: Local progress reset is complete and recoverable

Reset SHALL delete all catalog kana's FSRS states and review logs, including malformed records, without clearing unrelated application data. It SHALL serialize with normal review operations. A durable reset intent SHALL precede deletion and remain until deletion completes. Following an interruption, subsequent progress reads/writes SHALL complete the pending reset or surface an error rather than silently load partially reset progress. Repeated resets SHALL be safe. Dashboard and Progress SHALL reflect zero saved reviews and all kana unseen on their next focus/refresh; subsequent practice SHALL create fresh progress.

#### Scenario: Start again

- **WHEN** a learner resets progress for both alphabets and returns to Progress
- **THEN** studied and saved-review counts are zero and later answers create fresh history

#### Scenario: Interrupted deletion

- **WHEN** a reset fails after removing only some keys or before clearing its intent
- **THEN** it does not report success and a retry or reopened storage completes deletion before permitting progress operations

#### Scenario: Ordered writes

- **WHEN** a review commit is queued before reset and another after it
- **THEN** the earlier review is removed and only the later new review remains
