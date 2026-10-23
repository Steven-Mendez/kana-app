## Why

The arcade loop already rewards answers with motion and haptics, but it is silent. Short sound effects at the moments that matter (a right answer, a growing combo, finishing a round, keeping the streak alive) make the reward land without looking and give the game its arcade feel.

## What Changes

- Play short, original sound effects: a chime for a correct answer, a soft low tone for a mistake or reveal, a brighter rising chime when a combo lights a new kitsunebi (3, 6 and 9 in a row), a fanfare when a round ends (a bigger one for a perfect round), and an ignite sound when the results extend the daily streak.
- Each sound fires once with its existing visible and haptic feedback; sounds never replace them.
- A device-local Sound setting (on by default) mutes every effect. The iOS silent switch and Android silent/vibrate ringer modes also keep the game quiet, and sounds mix with other audio instead of pausing it.
- New `expo-audio` dependency (requires a new native build) configured without microphone permission or background playback. The clips are synthesized by `scripts/generate-game-sounds.mjs`, so they carry no third-party license.

## Capabilities

### New Capabilities

- `game-sounds`: sound effects for graded answers, combos, round results and the daily streak, and the setting that mutes them.

### Modified Capabilities

None.

## Impact

`expo-audio` in `package.json`, `pnpm-lock.yaml` and `app.json`; `assets/sounds/`; `scripts/generate-game-sounds.mjs`; new `src/lib/sounds.ts`; `src/components/study-session.tsx`, `src/components/study-results.tsx`, `src/app/settings.tsx`, `src/lib/copy.ts`; `jest-setup.js` mocks the native audio module. No synced data or route change.
