## MODIFIED Requirements

### Requirement: Expo Router owns application startup

The application SHALL start through `expo-router/entry`, resolve `/` to `src/app/(tabs)/index.tsx`, and manage its root navigation in `src/app/_layout.tsx`. Main destinations SHALL be grouped in `src/app/(tabs)/` with their navigator in `_layout.tsx`; study SHALL remain outside the tab group. The app SHALL use the `kana-app` URL scheme and enable typed routes. Internal source imports SHALL support the `@/*` alias mapped to `src/*`.

#### Scenario: Opening the home route

- **WHEN** the app starts at `/`
- **THEN** the initial screen renders through the root layout without a missing-route or registration error
- **AND** the previous root `App.tsx` and registration `index.ts` are no longer required

#### Scenario: Resolving an internal import

- **WHEN** source code imports a module or stylesheet through `@/`
- **THEN** TypeScript and Metro resolve it relative to `src/`
