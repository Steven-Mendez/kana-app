## Why

The Kana screen asks the learner to pick between Smart review and Free practice before every round, yet both are endless and both leave the review schedule alone when practising early: Smart review only saves answers for new kana, kana already due, and failures (`shouldSchedulePractice`). The only real differences are that Free practice samples uniformly and throws away its mistakes. That buys little, costs a decision every round, and loses the most useful signal (a missed kana should come back sooner).

## What Changes

- The Kana screen drops the scheduled/free mode selector. Start always opens Smart review with the selection, with a one-line explanation of how it adapts.
- The transient free round stays as an internal mode for the Home duel and old `/study` links without `mode=scheduled`; it is no longer offered on the Kana screen.
- Copy that mentions "Free practice" outside legal text refers to duels instead; unused strings are removed.

## Capabilities

### Modified Capabilities

- `kana-study`: the Kana bottom area has no mode selector and Start always begins intelligent review.

## Impact

`src/app/(tabs)/kana.tsx`, `src/lib/copy.ts`, `src/components/kana-screen.test.tsx`. No change to sampling, FSRS, storage, the study route or the duel. Builds on `add-arcade-navigation`, whose `kana-study` delta this one supersedes for the two requirements below.
