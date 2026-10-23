## Context

The visual direction is the published "Arcade kitsune" design system: outlined game pieces with a solid edge, a vermilion capsule button, kana cards that are stamped or flipped, rōmaji coins, a progress bar with kitsunebi, a flame streak and a gold or sumi feedback ribbon with the mascot. The app styles everything with Uniwind classes from `src/global.css`, which keeps raw `--palette-*` primitives separate from `--color-*` roles per appearance. No animation library is installed; `react-native-svg` and `expo-haptics` are.

## Goals / Non-Goals

**Goals:** one theme source extended in its own idiom; components that work the same on iOS, Android and web; motion on the UI thread; reduced motion and screen readers covered; components testable in Jest.

**Non-Goals:** changing existing screens (phase 3); lesson state, scoring, streak storage or input-mode logic; `ToggleGroup` selection groups, which belong with the screens that use them.

## Decisions

- **Tokens.** New colors become `--palette-*` primitives and `--color-*` roles inside the existing `light` and `dark` variants, so Uniwind generates `bg-gold`, `border-ai`, `text-on-bright`. The brand vermilion stays `primary`; its edge is `primary-lip`. Outlines use `foreground` (ink). Radii and font families go in `@theme` (`rounded-tile`, `rounded-card`, `font-display`, `font-ui`, `font-ui-bold`, `font-kana`).
- **Fonts at runtime, subset.** The full families weigh about 11 MB together. `scripts/subset-game-fonts.mjs` subsets the four weights from the `@expo-google-fonts/*` dev dependencies to Latin, macrons, punctuation, arrows and kana (about 330 KB in total) into `assets/fonts/`, with their OFL licenses. `useFonts` registers them under the same family names (`DelaGothicOne_400Regular`, …) on all platforms; the config plugin would take names from file metadata on iOS, which breaks a single class name. Glyphs outside the subset fall back to the system font. The root layout returns `null` until fonts resolve or fail.
- **Depth primitive.** `Depth` renders an edge `View` offset by `depth` and an `Animated.View` face on top, both outlined. A `Pressable` drives a shared value on press-in/out; the face's `translateY` uses `withTiming` (90ms, `Easing.bezier(0.23, 1, 0.32, 1)`). No `boxShadow` or `elevation`, so the edge looks identical everywhere and stays sharp.
- **Motion.** Reanimated 4: `withTiming`/`withSequence`/`withSpring` for pop, shake, stamp slam and flip, `SlideInDown` for the ribbon, `useReducedMotion()` to skip them. The progress fill is an absolutely positioned, childless view, so animating its width is safe.
- **Flip.** The card scales `scaleX` 1 → 0, swaps to the back at the midpoint through `scheduleOnRN`, then 0 → 1. `scaleX` avoids the perspective setup `rotateY` needs on Android while reading as a flip.
- **React Native Reusables.** Copy the Uniwind variants of `text` (for `TextClassContext`) and `progress` (for the progress bar semantics) plus `cn`, adjusting import paths. Install their peer packages with `pnpm exec expo install`.
- **Copy.** Accessibility and default labels live in `src/lib/copy.ts` for Spanish and English, read through `usePreferences().t`, like existing components.
- **Tests.** Add Reanimated's Jest setup (`react-native-reanimated` test helpers and the worklets mock) to `jest.config.js`; test states, labels, presses and the reduced-motion path with Testing Library.

## Risks / Trade-offs

- Reanimated needs a rebuilt development build → note it in the summary; Expo Go already includes it.
- Subset fonts miss kanji and rare symbols → those render in the system font; rerun the script if copy needs new ranges.
- Dela Gothic One is very heavy → used only for display roles (buttons, titles, scores).
