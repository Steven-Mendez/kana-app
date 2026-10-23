## Why

Typed answers only confirm themselves visually. A short, distinct vibration for correct and incorrect grades makes the result perceptible without looking away from the kana, which matters most while typing quickly on a phone.

## What Changes

- Play one success haptic when a card is graded correct and one error haptic when it is graded incorrect or revealed, exactly once per grade.
- Use `expo-haptics`: Android's system haptic constants (`Confirm` / `Reject`), iOS notification feedback, and the Web Vibration API where the browser and device support it. Unsupported platforms, disabled system haptics and failures stay silent and never affect grading.
- No new settings: the system haptics preference already controls it on iOS and Android.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kana-study`: haptic feedback for graded answers.

## Impact

New `expo-haptics` dependency (requires a new native build), a small `src/lib/haptics.ts` wrapper, `StudySession` and its tests.
