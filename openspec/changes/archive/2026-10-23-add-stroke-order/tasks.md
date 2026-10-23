## 1. Data

- [x] 1.1 Add `scripts/generate-kana-strokes.mjs` and generate `src/data/kana-strokes.json` for every catalogue glyph, failing on missing data.
- [x] 1.2 Record source and LGPL-3.0 attribution in `src/data/kana-strokes.md`.

## 2. Implementation

- [x] 2.1 Install `react-native-svg` with `pnpm exec expo install`.
- [x] 2.2 Add `KanaStrokes` with stepped animation, numbered stroke starts, yōon continuation, replay and reduced motion.
- [x] 2.3 Show it in the Syllabary detail panel with a static-glyph fallback and localized copy.

## 3. Verification

- [x] 3.1 Add tests for data coverage, numbering, replay and reduced motion.
- [x] 3.2 Run pnpm test --runInBand, pnpm lint, pnpm exec tsc --noEmit, pnpm check, pnpm build:web and strict OpenSpec validation.
- [x] 3.3 Verify a basic kana and a yōon on the iOS simulator and the web export.
