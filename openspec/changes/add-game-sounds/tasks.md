## 1. Implementation

- [x] 1.1 Install `expo-audio` with `pnpm exec expo install` and configure its plugin without microphone or background playback.
- [x] 1.2 Add `scripts/generate-game-sounds.mjs` and generate the clips in `assets/sounds/`.
- [x] 1.3 Add `src/lib/sounds.ts`: lazy players, audio mode, `playSound`, `answerSound`, the device-local preference and `useSoundEnabled()`.
- [x] 1.4 Play answer and combo sounds in `StudySession`, the fanfare and streak sound in `StudyResults`.
- [x] 1.5 Add the Sound setting with Spanish and English copy.

## 2. Verification

- [x] 2.1 Add tests for one sound per grade, the combo sound, results fanfares and muting.
- [x] 2.2 Run pnpm test, pnpm check and strict OpenSpec validation.
- [x] 2.3 Play correct, mistake and round-complete sounds on a new iOS development build and confirm the Sound setting persists.
