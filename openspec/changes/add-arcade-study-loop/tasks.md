## 1. Game logic

- [x] 1.1 `game-score.ts`: points, combo, grade and time, with tests.
- [x] 1.2 `game-streak.ts`: daily streak from review events, state, milestones and extended-today, with tests.
- [x] 1.3 `game-board.ts`: tile states and stability bar from saved cards, with tests.
- [x] 1.4 `game-choices.ts`: three coins with confusion-first, then round-kana distractors, with tests.
- [x] 1.5 `confusions.ts` and its store: resolve, record, top pair, generation reset, with tests.
- [x] 1.6 `useInputMode()`.

## 2. Round

- [x] 2.1 `StudySession`: `length` and `inputMode`, arcade header with progress bar and kana card, keyboard answer area restyled with the same IDs and labels.
- [x] 2.2 Touch answer area: coins, Check, Skip, ribbon, 900 ms correct feedback, scheduled save gating.
- [x] 2.3 Record confusions from graded mistakes; study route passes length, input mode and the recorder.
- [x] 2.4 Tests: touch grading, finite end (free and scheduled), confusion recording, unchanged keyboard tests.

## 3. Results

- [x] 3.1 Arcade results: grade stamp, scoreboard, totals, best streak, mistakes list and actions.
- [x] 3.2 Daily streak celebration when the round extended today's streak.
- [x] 3.3 Tests for the scoreboard, grade and streak celebration.

## 4. Home

- [x] 4.1 `useStudyProgress` exposes the card map.
- [x] 4.2 Home hub: streak badge, today's round with finite/endless choice and due review, duel, board, exploration link, loading and error states.
- [x] 4.3 Update Home tests for the round length and add board and duel tests.

## 5. Verification

- [x] 5.1 `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm check`.
- [x] 5.2 Web check in light at phone and desktop widths: Home, touch round, keyboard round, finite end, results.
- [x] 5.3 `openspec validate add-arcade-study-loop --strict`.
- [x] 5.4 Web check in dark at phone and desktop widths: Home, touch round, keyboard round, finite end, results.
- [ ] 5.5 Same screens on an iOS or Android development build.
