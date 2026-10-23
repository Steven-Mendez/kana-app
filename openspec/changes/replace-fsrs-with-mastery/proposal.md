## Why

FSRS optimises long-term retention over months for large decks. Kana are a small, fixed set that learners want to know within about two weeks, by drilling. With FSRS the kana bar sits at its 10% floor while learning, repeated answers in a session are discarded on purpose, and a kana jumps to "mastered" after two correct answers ten minutes apart. Learners cannot see themselves improving, and "nothing due" screens stop them from playing.

## What Changes

- **BREAKING:** FSRS is removed. Each kana gets a transparent mastery level from 0 to 100%, derived from its answers: +5% per correct answer, −10% per mistake, at most +20% per kana per local day. 100% is mastered, which takes at least five days of practice.
- Every graded answer in Smart review is saved, including repeated answers in the same session. Nothing is "practice only" any more. Duels stay transient.
- A kana is due again on the next local day while it is below 100%, and 14 days after its last answer once mastered. Home's review card lists due kana; there is no "nothing due" dead end in Smart review.
- Smart review weighs kana by low mastery, due status and recent mistakes, and halves the weight of kana that already reached today's cap.
- Kana tiles show the mastery bar for every studied, unmastered kana; the gold tile means 100%. The kana sheet shows the level and the study screen confirms the new level after each saved answer.
- Profile stages become To discover, Learning and Mastered.
- Saved history is kept: existing FSRS events are replayed as answers (Again is a mistake, any other rating is correct). Supabase accepts the new `mastery-v1` events and stores mastery instead of FSRS cards; cached progress rows are recomputed.

## Capabilities

### Modified Capabilities

- `spaced-repetition`: mastery replaces FSRS scheduling, every Smart review answer is saved, progress storage changes.
- `game-loop`: board tiles reflect mastery.
- `study-overview`: progress counts, due review and stages come from mastery.

## Impact

`src/lib/` (new `kana-mastery.ts`; `learning-domain`, `learning-repository`, `review-storage`, `study-progress`, `game-board`, `practice-sampling`; `spaced-repetition.ts` removed), study, scheduled study, Kana board and sheet, Profile, copy and their tests; `supabase/functions/sync-learning` and a new migration. Removes the `ts-fsrs` dependency. The learning document grows with every answer; sync already batches 100 events per request. Builds on `add-arcade-study-loop` and `add-arcade-navigation`, which should be archived first.
