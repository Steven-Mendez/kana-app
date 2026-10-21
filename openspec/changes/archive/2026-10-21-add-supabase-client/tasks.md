## 1. Client setup

- [x] 1.1 Install Supabase and Expo-compatible AsyncStorage using pinned pnpm and update the lockfile.
- [x] 1.2 Add ignored local configuration and a tracked environment template.
- [x] 1.3 Add the shared client with configuration checks, native storage, and web-safe defaults.
- [x] 1.4 Connect native refresh to the root layout lifecycle with cleanup.

## 2. Verification

- [x] 2.1 Verify configuration failures, native session restoration, and lifecycle cleanup with focused self-checks.
- [x] 2.2 Verify the supplied project with a read-only request and confirm local environment values are ignored.
- [x] 2.3 Run `pnpm check` (including `pnpm lint` and TypeScript's `tsc --noEmit`), web export, and native bundle checks.
- [x] 2.4 Validate and archive the completed OpenSpec change.

## Verification results

- `pnpm check`: passed ESLint, TypeScript, Prettier, and React Doctor.
- `pnpm build:web`: passed static rendering, including client initialization without browser globals.
- `pnpm exec expo export --platform all --output-dir <temporary directory>`: passed iOS/Android Hermes and web bundling.
- Node assertion self-checks against transpiled source and the real Supabase SDK: missing/empty configuration rejected, native sessions restored from a mocked AsyncStorage adapter, and web initialization avoided that adapter.
- Root-layout self-checks with mocked AppState: active/background/null/undefined startup states, background/resume transitions, listener removal, refresh cleanup, and web isolation passed.
- Read-only `/auth/v1/settings` request with the local URL and publishable key: HTTP 200. `git check-ignore .env.local`: confirmed ignored.
- Expo Go on the iOS simulator: app startup and background/resume passed; the live client returned Auth settings HTTP 200 and read the session without errors. An AsyncStorage test value survived a full app restart and was removed afterward.
- Expo web development server: startup passed without browser console errors after restarting Metro to load `.env.local`.
- `pnpm dlx expo-doctor`: all 20 checks passed.
