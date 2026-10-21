# Context

Authenticate with Apple, Google and email OTP while preserving guest study. Store private profiles, preferences, kana selection, review events and canonical FSRS progress.

# Decisions

Use the existing Expo SDK 58 app, Supabase client and ts-fsrs 5.4.2. Keep catalog data bundled and validate server kana IDs with a generated catalog. Auth uses native Apple on iOS, PKCE browser OAuth elsewhere, and email OTP. Learning documents are transactionally updated per account in SQLite/IndexedDB. Immutable review events are replayed deterministically; server commits use revision checks and service-only database functions. Settings mutations carry stable IDs so retries cannot overwrite newer writes. Guest migration retains original AsyncStorage data.

# Risks and rollout

Provider credentials, SMTP and redirect domains require external configuration. Verify database security locally, test deterministic replay and failure recovery, and gate production release on real-device OAuth checks. Do not deploy to a remote project without verifying its existing schema and configuration.

# Production scope

Launch web with Google and guest study, without SMTP. Google is enabled by default; Apple and email OTP require separate explicit build flags. Keep the provider implementations for future activation and restrict each service call as well as its UI. Google uses a web OAuth client with the Supabase callback; secrets stay in Supabase. Native OAuth acceptance remains a separate release gate.
