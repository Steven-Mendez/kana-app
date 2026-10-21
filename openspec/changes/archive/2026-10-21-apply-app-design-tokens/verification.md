# Verification — app design tokens

Date: 2026-10-21.

## Automated checks

- `pnpm test --runInBand`: 10 suites, 49 tests passed.
- `pnpm check`: passed ESLint, TypeScript, formatting, and React Doctor; 7 existing advisory warnings remain (component complexity, array lookup, and context value identities).
- `pnpm build:web`: exported 13 static routes successfully.
- Strict OpenSpec validation is recorded with the completed archive.

## Web

Checked Home, Practice, Syllabary, Progress, and Profile in light and dark appearance. Checked selected kana, navigation, theme persistence after reload, and free-study error/reveal/correct advancement. Computed styles resolve the approved palette; captured desktop screens have no horizontal overflow at 1456 × 853. Final preview uses `http://localhost:8091/practice`.

## Local iOS

Tested Expo Go on the Kakareta Demo simulator, iOS 26.5. Verified light Home, dark Settings/Home/Practice, selection preservation, and free study with the software keyboard visible. Confirmed incorrect feedback, reveal/next, automatic correct advancement, and a completed round with 2 correct / 1 incorrect. The answer field, feedback, and action remained visible above the keyboard. Corrected the native input caret to resolve the ring token.

Uniwind's generated native bundle resolves the primary tokens to `#d13b2b` (light) and `#f0614c` (dark), and the backgrounds to `#fdfbf7` and `#180e0f`. Source values remain exact OKLCH in the shared CSS.

Native tab icons and labels explicitly consume primary and muted foreground. iOS 26 owns the Liquid Glass background, so its material is not a flat CSS surface color. This platform limitation is documented in the [Expo native tabs guide](https://docs.expo.dev/router/advanced/native-tabs/). No Android runtime verification is claimed.

## Evidence

Screenshots and computed-style snapshots are saved locally in:

`/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/app-design-tokens/verification/`

Representative files:

- `web-home-light.png`, `web-home-dark.png`, `web-practice-final-dark.png`
- `web-computed-styles.json`
- `ios-home-final-light.png`, `ios-home-final-dark.png`, `ios-settings-dark.png`, `ios-practice-dark.png`
- `ios-study-error-keyboard-dark.png`, `ios-study-correct-keyboard-dark.png`, `ios-results-dark.png`

After relaunching Device Hub to recover its display connection, the final native tab configuration was verified on the persisted dark Home screen and after switching back to light. Both final Home screenshots include the themed native navigation bar.
