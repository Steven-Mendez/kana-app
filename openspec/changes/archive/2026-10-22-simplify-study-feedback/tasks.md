## 1. Immediate reading after a mistake

- [x] 1.1 Remove the hidden-reading stage from `studyReducer` so every graded card exposes its reading, keeping exactly-once grading and Next gating.
- [x] 1.2 Show the reading and submitted answer together in `StudySession` feedback and announcements; remove the Show reading action, its Enter stage and localized copy.

## 2. Compact study header

- [x] 2.1 Render one muted answered/correct summary in `StudyProgress`, adding the streak only from two consecutive correct answers, with updated localized copy.
- [x] 2.2 Align the feedback symbol with the first line of feedback text.

## 3. Verification

- [x] 3.1 Update reducer and component tests for the one-step mistake flow and compact header.
- [x] 3.2 Run pnpm test --runInBand, pnpm lint, pnpm exec tsc --noEmit, pnpm check and strict OpenSpec validation.
- [x] 3.3 Verify the mistake flow and header on the iOS simulator with the software keyboard open.
