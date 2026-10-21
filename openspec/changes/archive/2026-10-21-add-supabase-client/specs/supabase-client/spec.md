## ADDED Requirements

### Requirement: Supabase configuration is explicit

The application SHALL read `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` from Expo environment variables and export one shared `supabase` client from `src/lib/supabase.ts`. Local values SHALL remain ignored by Git, with required names documented in `.env.example`. Missing values SHALL produce a clear configuration error.

#### Scenario: Configuring the supplied project

- **WHEN** both public environment values are provided
- **THEN** the shared client targets that project with the publishable key
- **AND** modules can import it through `@/lib/supabase`

#### Scenario: Missing environment configuration

- **WHEN** either required environment value is absent or empty
- **THEN** client initialization fails with an error identifying the required variables

### Requirement: Sessions persist across supported platforms

The shared client SHALL enable session persistence and automatic token refresh, disable URL session detection, and use AsyncStorage on native. Web SHALL use Supabase's default browser-aware storage. Both platforms SHALL use the SDK's built-in refresh coordination. Static web export SHALL succeed without browser globals.

#### Scenario: Native session restoration

- **WHEN** the client starts on native with a valid persisted session
- **THEN** it restores that session from AsyncStorage

#### Scenario: Static web export

- **WHEN** Expo renders routes in Node with the public environment configured
- **THEN** client initialization succeeds without accessing native storage or requiring `window`

### Requirement: Native refresh follows the app lifecycle

The root layout SHALL start session refresh when the native app is active and stop it when inactive or backgrounded. It SHALL handle the initial state and remove its listener when unmounted. Web SHALL retain Supabase's built-in visibility handling.

#### Scenario: Backgrounding and resuming

- **WHEN** a native app transitions from active to background and back
- **THEN** automatic refresh stops and resumes accordingly

#### Scenario: Root layout cleanup

- **WHEN** the root layout unmounts
- **THEN** its AppState listener is removed and native refresh is stopped
