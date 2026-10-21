# app-structure Specification

## Purpose

Define the application's source organization, Expo Router startup, cross-platform Tailwind styling, and verification conventions so subsequent features share a consistent, spec-driven foundation.

## Requirements

### Requirement: Application source has explicit responsibilities

Application code SHALL live under `src/`. Routes and navigators SHALL live in `src/app/`, with navigators defined in `_layout.tsx`. Shared UI, static kana data, and integrations SHALL belong to `src/components/`, `src/data/`, and `src/lib/` respectively, created only when real modules need them. Configuration and assets SHALL remain at the repository root. Ordinary source filenames SHALL use kebab-case, and tests SHALL be colocated with their subject.

#### Scenario: Adding a shared module

- **WHEN** a shared UI component, kana dataset, or integration is added
- **THEN** it is placed in its designated directory outside `src/app/`
- **AND** it does not become an Expo Router route

#### Scenario: Starting from the foundation

- **WHEN** only the initial screen exists
- **THEN** `src/app/` contains its index route and root layout
- **AND** unused module directories do not require placeholder files

### Requirement: Expo Router owns application startup

The application SHALL start through `expo-router/entry`, resolve `/` to `src/app/index.tsx`, and manage its root navigation in `src/app/_layout.tsx`. The app SHALL use the `kana-app` URL scheme and enable typed routes. Internal source imports SHALL support the `@/*` alias mapped to `src/*`.

#### Scenario: Opening the home route

- **WHEN** the app starts at `/`
- **THEN** the initial screen renders through the root layout without a missing-route or registration error
- **AND** the previous root `App.tsx` and registration `index.ts` are no longer required

#### Scenario: Resolving an internal import

- **WHEN** source code imports a module or stylesheet through `@/`
- **THEN** TypeScript and Metro resolve it relative to `src/`

### Requirement: Tailwind styles work across platforms

The application SHALL support Tailwind CSS 4 classes on React Native components through Uniwind on iOS, Android, and web. `src/global.css` SHALL be the single entry for Tailwind imports and shared design tokens, imported by the root layout. The initial screen SHALL use utility classes for layout and typography and semantic background/foreground colors.

#### Scenario: Rendering the initial screen

- **WHEN** the initial screen renders
- **THEN** its content is centered with padding, a warm light background, and readable foreground text
- **AND** these styles come from Tailwind utilities and the shared CSS tokens

#### Scenario: Checking types before starting Metro

- **WHEN** a fresh checkout installs the locked dependencies and runs the TypeScript check
- **THEN** `className` props and the global CSS import are accepted without requiring a prior Metro startup

### Requirement: Foundation changes are verifiable

The project SHALL retain the pinned pnpm version, strict TypeScript, and the `pnpm check` quality gate. Web builds SHALL export static files to `dist/` compatible with the existing Vercel configuration. Package changes SHALL include the lockfile. Feature work SHALL follow the documented OpenSpec workflow.

#### Scenario: Verifying the foundation

- **WHEN** `pnpm check` and `pnpm build:web` run after installing the locked dependencies
- **THEN** both commands complete successfully
- **AND** the web export contains a working home page

#### Scenario: Implementing the next change

- **WHEN** a new feature changes application behavior
- **THEN** its proposal, requirements, design when needed, and tasks are recorded before implementation
- **AND** verification precedes completion and archival into the consolidated specifications
