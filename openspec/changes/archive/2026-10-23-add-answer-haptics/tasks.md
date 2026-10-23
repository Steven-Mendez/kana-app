## 1. Implementation

- [x] 1.1 Install `expo-haptics` with `pnpm exec expo install` and add a platform-aware `answerHaptic(correct)` wrapper that swallows failures.
- [x] 1.2 Trigger it once when `StudySession` records a new grade.

## 2. Verification

- [x] 2.1 Add component tests for one haptic per grade and none on duplicate events.
- [x] 2.2 Run pnpm test --runInBand, pnpm lint, pnpm exec tsc --noEmit, pnpm check and strict OpenSpec validation.
- [x] 2.3 Verify grading still works in the iOS simulator with the new native build.
