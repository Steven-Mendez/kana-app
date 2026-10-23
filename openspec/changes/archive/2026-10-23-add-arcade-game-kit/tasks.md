## 1. Setup

- [x] 1.1 Install Reanimated, worklets, the three Google font packages and the React Native Reusables peers with `pnpm exec expo install`.
- [x] 1.2 Add the `cn` helper and the Uniwind variants of React Native Reusables `text` and `progress`.
- [x] 1.3 Configure Reanimated for Jest.

## 2. Phase 1: tokens

- [x] 2.1 Add the arcade palette primitives and light/dark color roles to `src/global.css`.
- [x] 2.2 Add game radii and font families to the theme and load the fonts in the root layout.

## 3. Phase 2: components

- [x] 3.1 Depth primitive and `GameButton`.
- [x] 3.2 `KanaCard` with stamp, flip, combo halo and badge.
- [x] 3.3 `RomajiOptionPill`.
- [x] 3.4 `AnimatedProgressBar` with kitsunebi.
- [x] 3.5 `StreakBadge`.
- [x] 3.6 `FeedbackBottomSheet` with mascot, haptics and announcements.
- [x] 3.7 Spanish and English copy for labels and announcements.

## 4. Verification

- [x] 4.1 Component tests for states, labels, presses and reduced motion.
- [x] 4.2 `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm check`.
- [x] 4.3 Render every component on web in light and dark and compare with the design system.
- [x] 4.4 Validate the change with `openspec validate add-arcade-game-kit --strict`.
