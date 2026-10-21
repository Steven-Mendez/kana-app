# Context

Move learning data to SQLite on native and IndexedDB on web, preserving existing guest data and isolating accounts.

# Decisions

Use the existing Expo SDK 58 app, Supabase client and ts-fsrs 5.4.2. Keep catalog data bundled and validate server kana IDs with a generated catalog. Auth uses native Apple on iOS, PKCE browser OAuth elsewhere, and email OTP. Learning documents are transactionally updated per account in SQLite/IndexedDB. Immutable review events are replayed deterministically; server commits use revision checks and service-only database functions. Settings mutations carry stable IDs so retries cannot overwrite newer writes. Guest migration retains original AsyncStorage data.

# Risks and rollout

Provider credentials, SMTP and redirect domains require external configuration. Verify database security locally, test deterministic replay and failure recovery, and gate production release on real-device OAuth checks. Do not deploy to a remote project without verifying its existing schema and configuration.
