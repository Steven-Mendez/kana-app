## Context

The app uses Expo SDK 58, Expo Router, and static web export. It currently has no integration modules or authentication UI. The user supplied a publishable key and requested client setup only after confirming that the tutorial's `todos` table is unavailable.

## Goals / Non-Goals

**Goals:** Provide one importable client, local environment setup, persistent sessions, and native foreground refresh management.

**Non-Goals:** Todo UI, database schema or policy changes, login screens, deployments, and additional skill installation.

## Decisions

- Put the singleton in `src/lib/supabase.ts` and import it through `@/lib/supabase`, following the existing source conventions rather than introducing `utils/` or `App.tsx`.
- Use the requested AsyncStorage on native. Leave web storage to Supabase's browser-aware default so Node-based static rendering never reads AsyncStorage's browser implementation. Expo already supplies the URL implementation, so no URL polyfill is needed.
- Keep the requested `autoRefreshToken`, `persistSession`, and `detectSessionInUrl` settings. Supabase 2.118 coordinates concurrent refreshes itself; its migration guide deprecates custom locks, so use the SDK defaults.
- Register native AppState handling in a root-layout effect, including initial state and cleanup, instead of an unmanaged module-level listener that can accumulate during development.
- Read the exact supplied environment names with static property access for Expo's inlining. Throw a useful error for missing values. Store actual values in the already-ignored `.env.local` and setup placeholders in `.env.example`.
- Install through Expo using pinned pnpm, pin Supabase's version, and retain the lockfile. Existing Supabase skills cover the optional tooling step.

## Risks / Trade-offs

- AsyncStorage is unencrypted, as in the requested integration. This setup does not introduce sign-in UI; encrypted token storage can be addressed with the eventual authentication feature.
- Fresh checkouts and build environments need both public variables. The tracked environment template documents them, and missing values fail explicitly.
- The example `todos` query returned `PGRST205`; client validation will use a read-only Auth settings request instead of depending on an absent table.

## Migration Plan

Install dependencies, set local variables, add the client and lifecycle effect, then run quality checks and cross-platform bundle verification. Other build environments must provide the same public configuration. Rollback removes these additions; no remote data is changed.
