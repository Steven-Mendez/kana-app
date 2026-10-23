## Why

Phase 2 shipped the arcade game components, but Home, study and results still use the plain form-like screens. The approved "Arcade kitsune" design needs a hybrid round (coins on touch screens, typing on desktop), finite and endless rounds, a rewarding results screen, a real daily streak, a kana board and a duel with the learner's most confused pair.

## What Changes

- Study rounds offer two lengths: a finite round of 12 graded answers that ends in results by itself, and the existing endless round that ends when the learner finishes. Scheduling, commits and FSRS ratings stay exactly as they are.
- Rounds answer through coins on touch screens (three rōmaji choices, Check, Skip) and through the existing typing flow with a hardware keyboard on wide web screens.
- Study uses the game components: progress bar with kitsunebi, kana card that is stamped or flipped, feedback ribbon on touch, inline feedback while typing.
- Results show an arcade grade (S/A/B/C), points, best combo, accuracy and time, keep the mistakes list and actions, and celebrate a daily streak milestone.
- Home becomes a game hub: streak badge, today's round with a finite/endless choice and due review, a duel with the most confused pair, and a board of the current alphabet coloured by FSRS state.
- Wrong answers that spell another kana of the same alphabet are recorded as confusions in a separate local document, independent of FSRS events and of cloud sync.
- **BREAKING (specs only):** the study visual identity, the cardless typing prompt, the "no daily streaks or mastery" rules and Home's "no streaks or mastery" rule are replaced by the arcade equivalents, all derived from saved data.

## Capabilities

### New Capabilities

- `game-loop`: input modes, coin answering, finite and endless rounds, points, combo and grade, the daily streak, the kana board, confusion recording and duels.

### Modified Capabilities

- `kana-study`: feedback, results, visual identity, screen composition, accessibility, typing feedback and round length requirements gain the arcade and touch behaviour.
- `study-overview`: Home shows the streak, board and duel from saved data.
- `game-components`: the feedback ribbon can leave its haptic to the screen that graded the answer.

## Impact

`src/app/(tabs)/index.tsx`, `src/app/study.tsx`, `src/components/study-session.tsx`, `src/components/study-results.tsx`, `src/components/scheduled-study.tsx`, `src/lib/use-study-progress.ts`, new pure modules under `src/lib/` (round scoring, streak, board, choices, confusions, input mode) with tests, new Home sections under `src/components/`, copy strings, and updated Home and study tests. No change to `ts-fsrs` usage, review events, the learning document, sync or Supabase. Confusions are local to the device and do not sync yet.
