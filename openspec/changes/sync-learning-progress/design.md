# Context

Synchronize versioned FSRS events and field-level preferences through an authenticated Edge Function and transactional compare-and-swap RPC.

# Decisions

Use the existing Expo SDK 58 app, Supabase client and ts-fsrs 5.4.2. Keep catalog data bundled and validate server kana IDs with a generated catalog. Auth uses native Apple on iOS, PKCE browser OAuth elsewhere, and email OTP. Learning documents are transactionally updated per account in SQLite/IndexedDB. Immutable review events are replayed deterministically; server commits use revision checks and service-only database functions. Settings mutations carry stable IDs so retries cannot overwrite newer writes. Guest migration retains original AsyncStorage data.

# Risks and rollout

Provider credentials, SMTP and redirect domains require external configuration. Verify database security locally, test deterministic replay and failure recovery, and gate production release on real-device OAuth checks. Do not deploy to a remote project without verifying its existing schema and configuration.

Keep the pinned Deno dependency configuration inside `supabase/functions/sync-learning/deno.json` so both the local runtime and remote deployment bundler resolve the shared FSRS module. Verify the deployed endpoint rejects unauthenticated requests and check remote RLS and RPC privileges after applying migrations.

# Integration with origin practice and reset

Integrate origin commits 1ae0559 and 33a8049. Keep adaptive practice continuous, persist early Again events and keep early correct drills transient. Social access remains opt-in. Reset is a durable account-scoped request sent through the verified Edge Function. A server generation fences all subsequent commits, and a persistent reset request identity deduplicates lost-response retries. The same account advisory lock serializes resets and progress commits. Settings and selection are retained. Clients discard old-generation events, preserve settings operations and ignore late responses from older generations. An account reset requires connectivity to finish; its durable intent blocks new study and resumes through the existing retry loop. Guest reset is one local transaction.
