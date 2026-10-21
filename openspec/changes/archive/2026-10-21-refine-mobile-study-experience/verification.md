## Automated checks

- Jest: 29 tests across eight suites, including mixed-category selection, alphabet-wide bulk actions, default/explicit mode routing, zero-selection disabling, duplicate submission, save blocking/retry, and transient mistake drills.
- `pnpm check`: ESLint, TypeScript, formatting, and React Doctor pass. The same five nonblocking diagnostics remain: bounded catalog lookups, study component complexity, and provider value identity. No speculative refactoring or suppression was added.
- `pnpm build:web`: static export succeeds with the existing public routes.
- Expo Doctor: 20/20 checks pass after installing the required Expo Font peer and removing a stale duplicate in generated node_modules.
- Native iOS build succeeds and installs on Kakareta iPhone, iOS 26.5. Expo Symbols and its font peer are linked.
- Strict OpenSpec validation: all seven current specifications/change items pass.

## Browser verification

- Checked 390px, 320px, and 1280px layouts in light/dark themes. No horizontal overflow at 320px; start remains reachable with 150% root text sizing through the scrollable footer.
- Verified free-practice submission, results, reveal/mistake review offline, scheduled review saving, and persisted next-due state after reload.
- Verified direct Profile/Settings URLs, responsive navigation, theme/language persistence after reload, and preserved selection counts.
- Browser console contains no errors or warnings after the final direct-route reload.

## iOS verification

These are historical results from native UI automation whose repository scripts have since been removed.

- The app and study flows passed end-to-end: native tabs, guest Profile, theme/language changes, reset, empty selection, mixed alphabets, bulk selection, keyboard submission, explicit progression, perfect/imperfect results, mistake review, repeat, and preserved selection on exit.
- Fixed native tab/footer overlap by explicitly enabling safe-area edges. Fixed the study top inset using the native safe-area container.
- Moved keyboard avoidance outside that container to use screen-relative coordinates. Verified input/submission at iOS Accessibility Large text size, then completed a two-card round and its results; the large kana is capped at 1.5× while ordinary text continues scaling.
- Verified a scheduled two-card round saves both answers, shows 100% results, and restores the next-due state after stopping/relaunching the app. Reset simulator text size to its original Large setting afterward.
- The automation centered scroll targets before tapping because its visibility calculation included clipped rows; it waited for the native navigation animation before interaction.
- Screenshots and logs are in the session temporary directory under `kana-redesign-stable`, `kana-redesign-large-confirmed`, and `kana-redesign-scheduled`.

## Scope of verification

Runtime verification targets the iOS simulator and Chrome web. Android runtime and physical-iPhone/VoiceOver checks are not included in this change.
