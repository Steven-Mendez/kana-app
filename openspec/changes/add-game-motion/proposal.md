## Why

The arcade pieces look like a game but mostly sit still. Streaks, combos and results are the moments a learner should feel rewarded, and right now the flame is a static drawing and the results appear all at once.

## What Changes

- The streak flame is alive: lit flames sway and flicker from their base wherever they appear (the streak badge, the combo badge and the profile).
- Extending the streak on the results screen ignites the flame: it pops in, throws sparks and the day count bumps.
- A combo that grows makes the `×N` badge pop, and each new kitsunebi at the progress bar head pops in.
- The results screen plays in order: grade stamp, then the streak panel, then the scores rising in one by one.
- Saved-progress meters fill from empty when they appear and animate when the value changes.
- Correct-answer feedback on touch is short and stays put: the card hops, the stamp lands from just above its size, the ribbon rises a few pixels instead of sliding from the screen edge, and the round waits for Continue instead of advancing after 900 ms (it used to cut the ribbon off mid-flight). Typing keeps its quick auto-advance.
- Shared motion tokens (`src/lib/motion.ts`): one ease-out curve, `pop` and `settle` springs, durations and a 45ms stagger, so every piece moves with the same rhythm.
- Each new prompt deals in (the hero card rises and settles, the coins pop in one after another); a wrong card shakes its head after flipping; the mascot hops when right and shakes when wrong; the ribbon title pops.
- Gold spark bursts (`Burst`) when a combo lights a new kitsunebi and when the grade stamp slams onto the results; corrections rise in after the scores.
- Home sections rise in reading order (`Rise`) when progress arrives.
- Every motion runs on the UI thread and is replaced by the still state when reduce motion is on.

## Capabilities

### Modified Capabilities

- `game-components`: flames, streak badge, combo badge, progress kitsunebi and meters animate.

## Impact

`src/components/game/flame.tsx`, `src/components/game/streak-badge.tsx`, `src/components/game/kana-card.tsx`, `src/components/game/animated-progress-bar.tsx`, `src/components/game/meter.tsx`, `src/components/study-results.tsx`, `src/app/(tabs)/profile.tsx`, `src/components/game/feedback-bottom-sheet.tsx`, `src/components/study-session.tsx`; the touch timing in `add-arcade-study-loop`'s kana-study spec. `src/lib/motion.ts`, `src/components/game/burst.tsx`, `src/components/game/rise.tsx` (new), `src/components/game/romaji-option-pill.tsx`, `src/components/study-touch-answer.tsx`, `src/app/(tabs)/index.tsx`. No new dependency, no data or route change.
