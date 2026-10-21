## Context

Study uses a pure reducer over static kana, binary answers, and transient shuffled rounds. Only selection preferences are persisted. Supabase has no study schema or authentication UI. The user approved local-first FSRS integration and explicitly requested Jest plus React Native Testing Library.

## Goals / Non-Goals

**Goals:** Durable per-kana scheduling and full logs, deterministic FSRS updates, due-first finite rounds, safe retries, offline operation, and meaningful unit/component tests.

**Non-Goals:** Account synchronization, custom optimization, four-button self-grading, notifications, statistics dashboards, and restoring partially completed round scores.

## Decisions

- Pin `ts-fsrs@5.4.2` (published FSRS-6 implementation). Use `fsrs` with 0.9 retention, default weights/learning steps, and fuzz disabled. Main-branch v6 documentation has a different API. A thin pure module exposes initialization, outcome mapping, and scheduling using library types rather than recreating the algorithm.
- Keep `KanaCard` static; serialize `Card` separately with UTC ISO `due` and nullable `last_review`. Include `learning_steps`. Store complete library `ReviewLog` fields plus an idempotency ID; preserve log semantics instead of replacing log dates with the new due date.
- Store `{ version: 1, cardId, card, reviews }` at `kana-srs:v1:${cardId}`. One per-card write keeps state and history together. A single shared storage instance serializes reads and commits. Validate loaded data and refuse to overwrite corrupt/unsupported records. Retry with the same ID and timestamp; duplicate successful commits return existing progress. Existing preference patterns inform this small module, but failure must not silently reset review history.
- Load only selected card records. Queue reviewed cards whose due instant is at or before now in due order, followed by unseen cards in catalog order. Do not shuffle scheduled rounds. A fresh round reloads due eligibility; future learning steps wait until due rather than being forced into an immediate drill.
- Reuse StudySession with an optional asynchronous review commit callback. After a valid first submit/reveal, show feedback and save immediately. Disable advancement while saving or after a failure, expose retry, and prevent duplicate submissions synchronously. Successful scheduled rounds return to selection to load another queue; free-practice results retain repeat/mistake drills. Keep reducers free of I/O and timestamps.
- Keep user-visible scheduled copy bilingual alongside the existing localization approach. Explain that scheduled progress is local and durable while scores remain transient.
- Use Jest 30 and jest-expo for SDK 58, RNTL 14 and its compatible test-renderer peer. Migrate existing node:test imports to Jest while retaining useful assert checks, avoiding two test runners. Use explicit Jest imports where needed instead of broadly changing application types.

## Risks / Trade-offs

- [AsyncStorage has no cross-tab transaction] → Serialize within the app instance; document single-writer scope. Use transactional storage before supporting simultaneous browser-tab review.
- [Histories grow] → Keep records per-card rather than rewriting the entire catalog. Move to transactional append storage when review history size requires it; do not truncate silently.
- [Storage or clock failure] → Reject invalid data/dates and reviews before last_review, retain the same pending review for retry, and visibly report failures.
- [Leaving during a pending write] → Start persistence on grading, independently of component lifetime; only saved reviews survive a killed process. Do not claim pending work was saved.
- [Concurrent account/navigation work] → Integrate narrowly against current files and keep tests focused on scheduling behavior.

## Migration Plan

No SQL migration or history backfill. Missing keys mean new cards. Additive versioned local keys preserve selections and preferences. Reverting the feature leaves unused review data intact. Any later scheduler major upgrade requires an explicit version/migration review.

## Verification

Jest tests cover initialization, all four ratings, graduation/lapses, increasing successful-review intervals for fixed fixtures, due queues, binary mapping, invalid timestamps, UTC/DST equivalence, full-log round trips, idempotency, ordered commits, and failure recovery. RNTL covers submit/reveal, blank and duplicate events, saving/retry, and free-practice isolation. Run tests, pnpm check, web export, and available platform smoke checks before validating and archiving this change.
