## Context

The app uses Expo SDK 58, React Native 0.88, React 19.3, and pnpm 11.8.0. `index.ts` registers a root `App.tsx` displaying “Hello World”. There are no feature modules or existing specifications. Native directories and web exports are generated and ignored by Git.

The user requested the proposed folder structure with spec-driven development, then selected Tailwind for styling. This supersedes the earlier `src/theme.ts` proposal.

## Goals / Non-Goals

**Goals:**

- Establish one source root, a working Expo Router entry, and cross-platform Tailwind styling.
- Keep the initial screen small while exercising layout, typography, and semantic color classes.
- Record folder responsibilities and the OpenSpec lifecycle for subsequent changes.

**Non-Goals:**

- Practice screens, kana datasets, authentication, and Supabase initialization.
- A component library, theme switcher, or additional navigation destinations.

## Decisions

### Source layout

```text
src/
  app/
    _layout.tsx
    index.tsx
  css.d.ts
  global.css
  uniwind-types.d.ts
```

`src/app/` contains only routes and navigation layouts. `src/components/`, `src/data/`, and `src/lib/` are documented destinations, added when their first real module is needed. This avoids placeholder files and unused wrappers. Styles and tests stay alongside their owning code. Root configuration and `assets/` retain their existing locations.

Configure `@/*` to resolve to `./src/*`. Use kebab-case for ordinary filenames and Expo Router's required route conventions for layout files.

### Expo Router startup

Set `package.json`'s `main` to `expo-router/entry`, move the initial screen into `src/app/index.tsx`, and put the stack and status bar in `src/app/_layout.tsx`. Delete the obsolete registration file after migrating its screen. Configure the router plugin, the `kana-app` URL scheme, and typed routes in `app.json`.

Use Metro and static web output so the existing Vercel `dist/` deployment remains valid. SDK-compatible dependencies are selected by `pnpm exec expo install`.

### Tailwind CSS 4 with Uniwind

Use stable Uniwind 1.13 with Tailwind CSS 4. Expo documents Uniwind as a universal Tailwind option, and its declared React/React Native peer ranges include this project's versions. Its Metro integration supports `className` without an extra Babel preset or animation dependency. NativeWind 4 targets Tailwind 3; NativeWind 5 is currently a release candidate.

Wrap Expo's default Metro configuration with `withUniwindConfig`, pointing to `src/global.css` and generated `src/uniwind-types.d.ts`. Import CSS once in the root layout. The CSS location covers all application source files for class scanning. Declare CSS modules in `src/css.d.ts` for TypeScript's side-effect import checks.

Define the initial light background and foreground as semantic CSS theme tokens; use Tailwind's existing spacing and typography scales. Keep a single token source, with no parallel TypeScript theme. Keep generated Uniwind type declarations in version control so `pnpm check` can run before Metro starts, and exclude that generated file from formatting.

### Spec-driven workflow

Maintain proposal, design, requirements with scenarios, and implementation tasks for this change. Document the workflow in `AGENTS.md`, including checking existing specifications before each change and archiving completed changes to consolidate requirements.

## Risks / Trade-offs

- Entry-point and Metro changes can break startup → verify static web export, browser rendering, and JavaScript exports for iOS and Android.
- Successful web output does not prove native behavior → verify native bundling separately and report device-runtime testing independently.
- Existing native development builds can lack newly installed native dependencies → regenerate/rebuild through Expo when running native locally; do not edit generated native files.
- Tool-generated typings can conflict with formatting → ignore only the generated Uniwind declaration in Prettier.

## Migration Plan

1. Validate the OpenSpec artifacts before implementation.
2. Install compatible routing and styling packages and retain the lockfile.
3. Update entry/configuration, migrate the screen, add CSS tokens, and document conventions.
4. Run OpenSpec validation, `pnpm check`, `pnpm build:web`, Expo dependency checks, and startup smoke checks.
5. Mark completed tasks and leave the verified change ready for archival.

Rollback consists of reverting this change's source/configuration and lockfile together; no user data or database schema is involved.

## Open Questions

None for this foundation change.
