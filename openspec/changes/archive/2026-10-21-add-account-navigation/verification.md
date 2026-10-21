# Verification — 2026-10-21

Historical verification record. The native UI automation scripts used for these runs have since been removed; they are not part of the current test suite.

## Automated checks

- The 12 catalog, grading, selection-storage, and preference-storage tests pass. Preferences reject malformed/unsupported values, do not write during hydration, serialize writes, and recover after rejection.
- Tests also pass under the Jest runner introduced by the concurrent spaced-repetition change: `pnpm test --runInBand src/data/kana.test.ts src/lib/study.test.ts src/lib/selection-storage.test.ts src/lib/preferences-storage.test.ts`.
- Web static export includes `/`, `/study`, `/profile`, and `/settings` in a synchronous bundle. iOS and Android Hermes exports succeed.
- Both change specifications pass strict OpenSpec validation.
- Final `pnpm check` passes ESLint, TypeScript, formatting, and React Doctor. Doctor retains five nonfatal diagnostics: two bounded family-array lookups, study component complexity, and two context-value identity warnings. No diagnostics were suppressed.
- The integrated repository's Jest suite passes all 28 tests in seven suites.

## Browser

- Tested production export at 320×568, 390×844, and 1440×900. Selection, Profile, and Settings have no horizontal overflow or visible interactive targets below 44×44px. Phone navigation is below content; desktop navigation is above it.
- Settings immediately changes appearance and Spanish/English copy. Reload restores dark/English. Selection reset affects only the selection. Profile displays actual per-alphabet counts and a disabled sign-in entry.
- At 320px with 150% root text size, settings and selection remain scrollable with reachable controls and no horizontal overflow.
- Injected storage read/write failures for both preference keys: localized notices appear, editing remains usable, and restoring storage followed by another edit saves successfully and clears the notices.
- Keyboard Tab gives the first study action a visible 2px focus outline; Enter activates it. Accessible snapshots expose checkbox/radio state and disabled sign-in.
- Lost connectivity on the loaded selection page before the first study navigation. Completed a ten-card mixed round, checked ten distinct prompts, 60% scoring, four-card mistake review, original ten-card repeat, and preserved selection on return.
- Reloading study starts at 0/5 rather than restoring the previous result. Study input measures 192px at all three widths.
- Light/dark contrast calculations pass: normal foreground, supporting text, primary-action text, and feedback exceed 4.5:1; selected indicators exceed 3:1.

## Native

- The retired native UI automation exercised navigation, both themes/languages, guest Profile, selection reset, and study on Expo Go.
- Android completed empty/single-card selection, mixed alphabets, scoped bulk actions, keyboard submission, wrong/correct/revealed answers, results, mistake review, and original-selection repeat.
- iOS exposed a first-tap issue after keyboard grading. Study now explicitly dismisses native input focus and allows answer-action taps through the ScrollView. A focused answer → single tap → results regression check passes.
- Native screenshots confirm dark/light semantic colors, safe-area spacing, and status-bar appearance on iOS and Android.
- The final Android app flow passes with the concurrent change's Free practice entry. Android hardware back returns to the preserved selection; after stopping Expo Go and reopening through adb, both selected families and dark/English preferences are restored.
- iOS was also inspected at the accessibility-medium system text size: controls wrap and the content remains within the viewport. The normal system text setting was restored afterward.
- The latest iOS run passed navigation/settings/profile, single-card grading/results/review, and mixed-card grading, then the XCUITest driver disconnected (`Connection refused` / EOF). An earlier full iOS study run passed before the navigation extension. Final uninterrupted iOS replay and native background/foreground verification remain environment-limited; browser reload/reset and Android restart/back were checked separately.

## Evidence and limits

Browser screenshots were saved in the session temporary directory as `final-{practice,profile,settings,study,results}-{320,390,1440}.png`, plus `layout-settings-dark.png`, `layout-profile-dark.png`, and `settings-320-large.png`. These temporary artifacts are historical evidence, not maintained test fixtures.

Verification uses Chrome, iOS Simulator, and Android Emulator with Expo Go. Physical devices, VoiceOver/TalkBack spoken output, release binaries, and store delivery were not exercised. Sign-in is intentionally a layout-only placeholder per the user's clarification.

For current native checks, open the app in a compatible simulator or development build and exercise navigation, preferences, selection, and study directly. Use Free practice when checking the transient loop to avoid changing spaced-repetition history. Run the maintained component and domain tests with `pnpm test --runInBand` and repository checks with `pnpm check`.
