## Why

Kana needs a shared Supabase client configured for the supplied project. The user confirmed that this task is client setup only, rather than adding the tutorial's todo screen.

## What Changes

- Install Supabase and Expo-compatible AsyncStorage with pnpm and update the lockfile.
- Add the supplied public configuration to ignored `.env.local`, with a tracked `.env.example` for setup.
- Export a shared client from `src/lib/supabase.ts` with persistent sessions, automatic token refresh, and explicit configuration validation.
- Tie native token refresh to the root layout's app lifecycle while keeping browser storage and static export compatible.

## Capabilities

### New Capabilities

- `supabase-client`: Public environment configuration and a cross-platform, persistent Supabase client.

### Modified Capabilities

None.

## Impact

Touches `package.json`, `pnpm-lock.yaml`, environment files, `src/lib/supabase.ts`, and `src/app/_layout.tsx`. The home screen and remote database schema stay as they are. The repository already includes Supabase agent skills.
