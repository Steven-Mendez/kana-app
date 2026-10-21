# Verification

## Automated checks

- Jest: 55 tests passed across 10 suites, including individual selection, partial-row selection, row toggling and persistence regressions.
- `pnpm check`: passed ESLint, TypeScript, formatting and React Doctor. Four existing React Doctor warnings remain in StudySession and provider context values.
- `pnpm build:web`: passed; 13 routes exported.
- `openspec validate align-catalog-and-account-headers --strict`: passed before archive.

## Web observation

Verified in the live local app at `http://localhost:8091` using the in-app browser.

- Desktop Practice and Syllabary alphabet controls both measured y=145, height=72, width=384. Categories both measured y=159, height=44, width=384.
- At 320 by 852, both screens measured alphabet y=125, height=72 and categories y=217, height=58. No horizontal clipping appeared.
- Actual kana cells retain equal width and height: desktop diameter 64 pixels, narrow-web minimum target 44 by 44. Combined kana were also checked (36 circular cells).
- Desktop catalogs use two compact reading blocks with repeated vowel headings; phone catalogs retain a single continuous grid.
- Row selection was checked from complete to partial via an individual cell, then back to complete using Space on the row checkbox. Individual and row checked semantics are exposed in the DOM.
- A zero selection disables Start. A row toggle affects only that row.

## iOS simulator observation

Verified in the local iOS 26.5 simulator.

- Both catalogs share aligned alphabet/category controls, prominent Japanese alphabet glyphs and circular kana cells.
- Practice row checkbox selected all five vowels, an individual vowel produced a mixed row, and the row checkbox completed and cleared the row.
- Profile and Settings first content now appears below the native header. The minimal back arrow no longer overlays the logo or first text. Profile back navigation returned to Home with selection intact.
- Enlarged-text checks confirmed shared stacking of catalog controls and a readable Profile header. These checks preceded the final circle-size adjustment; final normal-size screenshots were refreshed afterward.
- Account scrolling and interactive swipe-back could not be conclusively verified through DeviceHub automation: attempted scroll/drag actions did not visibly move content. The implementation retains standard ScrollView behavior, automatic insets and native gestures; no claim of a full native scrolling pass is made.

## Artifacts

Screenshots and DOM bounds are saved in `/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/catalog-alignment/`:

- `web-practice.png`, `web-syllabary.png`
- `web-practice-320.png`, `web-syllabary-320.png`
- `web-bounds.json`
- `ios-practice.png`, `ios-syllabary.png`
- `ios-profile.png`, `ios-settings.png`, `ios-profile-large.png`
