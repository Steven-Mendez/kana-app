## MODIFIED Requirements

### Requirement: Supabase configuration is explicit

The application SHALL read `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` from Expo environment variables and export one shared `supabase` client from `src/lib/supabase.ts`. Actual project values SHALL remain outside tracked files and published branch history. Environment files SHALL be ignored except `.env.example`, which SHALL contain placeholders and deployment setup instructions. Cloud builds SHALL receive both values from their deployment environment; Vercel SHALL store them as Config variables for Production and Preview. Missing values SHALL produce a clear configuration error.

#### Scenario: Configuring the supplied project

- **WHEN** both public environment values are provided
- **THEN** the shared client targets that project with the publishable key
- **AND** modules can import it through `@/lib/supabase`

#### Scenario: Missing environment configuration

- **WHEN** either required environment value is absent or empty after environment resolution
- **THEN** client initialization fails with an error identifying the required variables

#### Scenario: Production export from a clean checkout

- **WHEN** `pnpm build:web` runs without local environment files and the deployment supplies both variables
- **THEN** Expo uses the supplied environment values
- **AND** static rendering completes successfully

#### Scenario: Project values stay outside Git

- **WHEN** a developer configures `.env.local` or `.env.production`
- **THEN** Git ignores the file while `.env.example` remains trackable
- **AND** actual Supabase values are absent from tracked files and published branch history
