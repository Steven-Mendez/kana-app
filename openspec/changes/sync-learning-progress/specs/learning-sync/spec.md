## ADDED Requirements

### Requirement: Sync converges without losing events

The app SHALL retain pending events until acknowledgement, replay unique events by timestamp then identifier with pinned FSRS settings, and retry concurrent revisions. Distinct offline events SHALL survive even when the merged schedule makes them early.

#### Scenario: Two devices review the same kana offline

- **WHEN** two devices review the same kana offline
- **THEN** Both events survive and both devices converge to the same canonical state.

### Requirement: Sync is visible and account scoped

The app SHALL synchronize on sign-in, foreground, local mutation and explicit retry, back off on network failures, display local/syncing/synced/attention states, and never send another account’s queue.

#### Scenario: A session expires with pending reviews

- **WHEN** a session expires with pending reviews
- **THEN** Local study continues and pending events remain isolated until the same user signs in again.

### Requirement: Canonical commits and settings retries are idempotent

The Edge Function SHALL derive ownership from a verified JWT, validate the versioned kana catalog and supported algorithm, and confirm events, derived FSRS logs and progress in one service-only transaction. It SHALL reload and recompute after revision conflicts. Replaying an identical event SHALL be a no-op; a reused identifier with different content SHALL return a conflict. Preferences SHALL synchronize per field and selection per kana, including explicit deselection, with the last server-accepted write winning. Stable operation identifiers SHALL prevent retries of old settings from replacing newer values.

#### Scenario: A successful response is lost

- **WHEN** a client retries events after the server committed but the response was lost
- **THEN** the server acknowledges the existing events without increasing their counts or progress revisions

#### Scenario: An identifier is reused with different content

- **WHEN** a client submits a different rating under a confirmed event identifier
- **THEN** the server returns a conflict and preserves the original history

#### Scenario: An old settings response is lost

- **WHEN** a previously accepted settings operation is retried after a newer operation
- **THEN** the newer settings remain authoritative

#### Scenario: The app becomes inactive during a failure

- **WHEN** the app enters the background during retry backoff
- **THEN** retries pause and foreground activation starts synchronization again

### Requirement: Account reset cannot resurrect deleted progress

A confirmed reset SHALL atomically remove the account's review events and derived progress on the server, retain preferences and selection, and increment a persistent generation. Every synchronization request SHALL include its generation. A stale device SHALL adopt the newer generation and discard pre-reset pending reviews before submitting any more events. Reset requests SHALL have durable identities so a retry after a lost response does not delete new post-reset progress. Pending resets SHALL block review commits and resume after restart or reconnection. Only the verified account owner SHALL be able to request its reset.

#### Scenario: An offline device reconnects after reset

- **WHEN** a device submits old pending reviews after another device reset the account
- **THEN** no old event is committed and the device adopts the new generation

#### Scenario: A reset response is lost

- **WHEN** the same reset identity is retried after new progress was created
- **THEN** the reset is acknowledged without deleting that new progress
