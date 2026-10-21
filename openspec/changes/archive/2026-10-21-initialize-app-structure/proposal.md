## Why

Kana currently boots a single root-level `App.tsx`. Establishing a small, documented structure before adding practice and account features gives the app one routing convention, one styling system, and a spec-driven workflow.

## What Changes

- Adopt Expo Router with routes and the root navigator in `src/app/`.
- Replace the custom root registration with `expo-router/entry` and migrate the existing initial screen.
- Use Tailwind CSS 4 through Uniwind for React Native and web, with shared design tokens in `src/global.css`.
- Define `src/components/`, `src/data/`, and `src/lib/` as the homes for shared UI, the kana catalog, and integrations; create each when it has real content.
- Configure the `@/*` source alias and document the proposal → specs/design → tasks → implementation → verification → archive workflow.

## Capabilities

### New Capabilities

- `app-structure`: Source organization, Expo Router startup, cross-platform Tailwind styling, and development verification conventions.

### Modified Capabilities

None.

## Impact

- Application entry files, `package.json`, `pnpm-lock.yaml`, `app.json`, `tsconfig.json`, Metro configuration, and `AGENTS.md`.
- Adds SDK-compatible Expo Router dependencies, Uniwind, and Tailwind CSS.
- Web continues exporting to `dist/` for the existing Vercel configuration.
- Supabase initialization, authentication, kana data, and practice behavior belong to subsequent changes.
