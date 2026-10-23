## Context

The learning document already stores an append-only log of answers (`LearningEvent`: id, kana, rating, time, device, algorithm) and derives per-kana progress by replaying it. FSRS is only that derivation, plus a gate that drops early correct answers. Supabase stores the same log and a cached copy of the derived progress.

## Decisions

### Keep the event log, replace the derivation

`replayEvents` becomes a mastery fold over a kana's events. The event shape is unchanged, so local documents, guest import and sync keep working. New events carry `algorithm: 'mastery-v1'`; validation also accepts the legacy `fsrs-5.4.2-r90-v1` tag so existing history stays valid. Ratings stay 1–4: the app writes 3 for correct and 1 for a mistake; legacy 2–4 count as correct.

### Mastery rules

- Level 0–100. A correct answer adds `min(5, 20 − gainedToday)`; a mistake subtracts 10, never below 0. Losses do not restore today's allowance.
- Days are local calendar days of the device that replays. The server copy is a cache; clients always rebuild from events.
- Mastered means level 100. Due: next local midnight after the last answer while unmastered; last answer + 14 days once mastered.
- Alternatives rejected: tuning FSRS (still ignores in-session drilling, worse scheduling); FSRS plus a separate meter (two models that can disagree); accuracy only (fills in one afternoon).

### Stored progress v2

`{ version: 2, cardId, mastery: { level, answers, correct, gainedToday, day, lastAnswer, due }, reviews: [{ id, rating, review }] }`. `reviews` keeps the existing event-consistency checks. Documents holding v1 (FSRS) progress are rebuilt from their events when read. The legacy AsyncStorage migration only needs review ids, ratings and times, so it uses a small v1 reader.

### Supabase

A migration widens the event algorithm check to both tags, deletes cached progress rows, switches the progress algorithm to `mastery-v1`, and redefines `commit_learning_base` to read `due` from `mastery.due`. The Edge Function recomputes progress for kana with new events and for kana whose cached row is missing or not v2, so caches heal on the next sync.

## Risks

- More events: every answer is stored. Acceptable for a ~214-kana catalogue; sync batches stay at 100.
- Day boundaries depend on the replaying device's time zone; a learner who changes zone may see today's cap shift. Accepted.
