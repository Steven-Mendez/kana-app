## 1. Dependencies and configuration

- [x] 1.1 Install SDK-compatible Expo Router dependencies, Uniwind, and Tailwind CSS 4 using pinned pnpm; retain the lockfile.
- [x] 1.2 Configure the router entry, plugin, scheme, typed routes, static web output, source alias, and Uniwind Metro integration.

## 2. Source structure and conventions

- [x] 2.1 Migrate the initial screen into `src/app/`, add the root stack and shared CSS tokens, generate className typings, and remove obsolete root entry files.
- [x] 2.2 Document directory responsibilities, Tailwind conventions, and the OpenSpec lifecycle in `AGENTS.md`.

## 3. Verification

- [x] 3.1 Validate the OpenSpec change, dependency compatibility, and `pnpm check` (including `pnpm lint` and the `tsc --noEmit` check).
- [x] 3.2 Run `pnpm build:web`, smoke-test the exported home page and Tailwind styles in the browser, and export iOS/Android JavaScript bundles; record results and runtime limitations.
- [x] 3.3 Rebuild and install the iOS debug app, verify startup and Tailwind styling on the local simulator, and check runtime logs.
- [x] 3.4 Rebuild and install the Android debug app, verify startup and Tailwind styling on the local emulator, and check runtime logs.

## Verification results

- `openspec validate initialize-app-structure --strict`: passed.
- `pnpm install --frozen-lockfile`: passed with pnpm 11.8.0.
- `pnpm check`: passed ESLint, TypeScript, Prettier, and React Doctor.
- `pnpm dlx expo-doctor`: 20/20 checks passed after moving an identical stale nested `expo-constants` copy out of `node_modules`; the lockfile contains one version.
- `pnpm build:web`: exported the static home page to `dist/`.
- Browser assertions passed for rendered content, CSS background/foreground tokens, 16px padding and font size, centered layout, and no horizontal overflow at 390×844. No console warnings or errors were observed.
- `pnpm exec expo export --platform ios --platform android --output-dir <temporary-directory>`: both Hermes bundles exported successfully.
- iOS Debug rebuilt and installed on Kakareta iPhone (iOS 26.5). Initial launch, cold restart, and return from the background passed. Screenshots at 1206×2622 verified centered content and the background/foreground tokens; cold-start and resumed content matched exactly.
- Android Debug rebuilt and installed on Medium_Phone_API_37.0 (Android 17). Cold start and return from the background passed. UI Automator verified the app's “Hello World” text and centered bounds; screenshots at 1080×2400 verified both color tokens.
- Metro, Android runtime logs, and iOS simulator logs were inspected after successful launches. No JavaScript errors, error overlays, or app crashes were observed. iOS emitted system networking-analytics messages; native builds retain upstream dependency warnings.
- Local build recovery: regenerated stale CocoaPods artifacts and cleared the iOS build cache after a Release React Native binary was incorrectly marked Debug. Launched the installed Expo CLI directly when pnpm's automatic install subprocess stalled. Metro now runs in LAN mode because localhost mode bound only to IPv6 and Android could not load the bundle.
- Android 17's local-network permission was accepted in the emulator for the debug server connection. Expo requests it only in Debug builds on API 37 or later.
- Screenshots, Android UI dumps, and runtime logs were saved in the temporary `kana-native-verification` directory. Physical devices and production builds were not tested in this run.
