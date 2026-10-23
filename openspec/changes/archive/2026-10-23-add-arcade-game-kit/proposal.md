## Why

Study screens feel like forms: flat buttons, plain text feedback and a text-only streak. The approved "Arcade kitsune" direction gives the app the tactile, rewarding feel of a game with its own identity, and the screen redesign (phase 3) needs shared tokens and components to build on.

## What Changes

- Extend the existing Uniwind theme in `src/global.css` with the arcade palette (tangerine, gold, kitsunebi, ai, sumi, locked and their edge/text roles), game radii, and the display, UI and kana font families, in light and dark.
- Subset Dela Gothic One, Zen Kaku Gothic New and Zen Maru Gothic to Latin, kana and punctuation and load them at runtime, so the same family names resolve on iOS, Android and web.
- Add a shared depth primitive: an ink-outlined face over a solid edge that presses down on touch.
- Add the core game components: `GameButton`, `KanaCard`, `RomajiOptionPill`, `AnimatedProgressBar`, `StreakBadge` and `FeedbackBottomSheet`, with Reanimated motion, haptics and reduced-motion support.
- Add React Native Reusables primitives (`text`, `progress`) and the `cn` helper in their Uniwind variant.
- Existing screens are not changed; adopting the components is phase 3.

## Capabilities

### New Capabilities

- `game-components`: the shared arcade components, their states, motion, feedback and accessibility.

### Modified Capabilities

- `app-design-system`: adds the arcade color roles, radii and font families to the single theme source.

## Impact

`src/global.css`, root layout font loading, new files under `src/components/game/` and `src/components/ui/`, `src/lib/utils.ts`, copy strings in `src/lib/copy.ts`, Jest setup. New dependencies: `react-native-reanimated`, `react-native-worklets`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@rn-primitives/slot`, `@rn-primitives/progress`; dev dependencies: three `@expo-google-fonts/*` packages and `subset-font`, plus `scripts/subset-game-fonts.mjs` and the generated `assets/fonts/`. Reanimated is a native module: development builds must be rebuilt.
