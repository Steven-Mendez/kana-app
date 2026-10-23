## Context

`StudySession` owns a careful state machine: `studyReducer` grades each card once, scheduled answers commit exactly once through `onCommitReview` with retry gating, correct answers auto-advance, and the input keeps focus. 30 tests protect it. `ScheduledStudy` decides eligibility with FSRS and turns too-early successes into practice-only answers. Home reads saved FSRS cards through `useStudyProgress`. Review events are in the learning document (`document.events`) with `reviewedAt`, but carry no submitted answer.

## Goals / Non-Goals

**Goals:** arcade presentation for Home, study and results; touch answering; finite and endless rounds; scoring; streak, board and duel from real data; no behavioural change to grading, commits or FSRS.

**Non-Goals:** changing tabs/navigation (`NativeTabs` stays), syncing confusions, changing `LearningEvent`, the learning document, `ts-fsrs` options or `shouldSchedulePractice`, mistake requeueing inside a round, the Practice selection screen beyond what starting a round needs.

## Decisions

- **Keep the engine, replace the skin.** `studyReducer`, `nextPracticeCard`, the commit/retry flow and the auto-advance timer stay as they are. `StudySession` gains `inputMode` (default `keyboard`, so existing tests keep exercising typing) and `length` props. The keyboard branch keeps every test ID and label (`romaji-input`, `check-answer`, `study-action`, `answer-feedback`, …) with new visuals.
- **Touch answers through the reducer.** Check dispatches `input` with the coin's canonical reading; if that grades correct the reducer has already graded it, otherwise a `submit` follows in the same handler through the synchronous ref guard. Skip dispatches `reveal`. So touch and typing share one grading path and one commit per grade.
- **Finite rounds without touching FSRS.** `advance` checks `length`: once the number of grades reaches it, it dispatches `finish` instead of `next`. Because `advance` already waits for the save, a scheduled round ends only after its last review is committed. The round count never alters ratings or eligibility.
- **Pure game modules.** `game-score.ts` (points, combo, grade), `game-streak.ts` (days from events, state, milestone, extended-today), `game-board.ts` (tile state and stability bar), `game-choices.ts` (coins with seeded randomness for tests), `confusions.ts` (resolve a wrong answer to another card, pair counting, top pair, document parse/merge). All tested in Jest.
- **Confusion store.** A document `confusions:<account>` in the same `learningDb` key-value store, written through `update` in its own transaction: `{ version: 1, generation, pairs: { "<a>|<b>": { count, last } } }` with ids sorted. A different generation reads as empty and the next write replaces it, so a progress reset hides old confusions without touching the reset flow. Writes are fire-and-forget with errors swallowed. `useConfusions()` reads it on focus and exposes `record`.
- **Streak source.** `document.events` from `useLearning()`; local calendar days via `toDateString()`. The results screen compares the streak computed from events before the round (captured at mount) with the current one to know whether today was just added.
- **Input mode.** `useInputMode()` reads `matchMedia('(pointer: fine)')` and `useWindowDimensions().width` on web and listens for the first printable `keydown`; native returns `touch`. The study route passes it to `StudySession`.
- **Haptics once.** Study keeps calling `answerHaptic` on the first grade; the ribbon gets `haptic={false}`.
- **Home.** A new `GameHub`-style composition in `index.tsx` with `HomeRound`, `HomeDuel` and `HomeBoard` components. `useStudyProgress` additionally exposes the loaded card map so the board needs no second read.

## Risks / Trade-offs

- The study screen is large → touch UI goes in `study-answer-touch.tsx`, results in the rewritten `study-results.tsx`, keeping `study-session.tsx` focused on state.
- Confusions don't sync → recorded per device; stated in the proposal and the duel copy does not claim otherwise.
- Coins make answers easier than typing → touch is the phone default by request; the keyboard flow remains on desktop.
