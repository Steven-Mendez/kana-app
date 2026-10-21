## 1. Native foundation

- [x] 1.1 Add Expo Symbols, refine shared visual primitives/tokens, and keep the lockfile in sync.
- [x] 1.2 Group main routes under native tabs, configure headers/theme/safe areas, and preserve responsive web navigation and URLs.

## 2. Learning experience

- [x] 2.1 Implement category-filtered family selection, compact mode choice, one start action, and localized explanatory copy.
- [x] 2.2 Recompose study progress, central prompt, keyboard-aware answer area, feedback, and results without changing grading or FSRS behavior.
- [x] 2.3 Align Profile and Settings spacing/surfaces with the shared visual language.

## 3. Verification

- [x] 3.1 Add focused selection interaction coverage and verify the new navigation/start controls on native (the original UI automation was subsequently retired).
- [x] 3.2 Exercise selection, both study modes, results, preferences, and persistence on iOS and web; inspect light/dark, narrow, keyboard, and large-text layouts.
- [x] 3.3 Run Jest, pnpm lint, pnpm exec tsc --noEmit, pnpm check, web export, and strict OpenSpec validation; fix failures.
- [x] 3.4 Record verification results and archive the change through OpenSpec.
