# Why

Move learning data to SQLite on native and IndexedDB on web, preserving existing guest data and isolating accounts.

# What Changes

- Move learning data to SQLite on native and IndexedDB on web, preserving existing guest data and isolating accounts.
- Add automated verification and deployment documentation.

# Capabilities

## New Capabilities

- `learning-repository`: Transactional local learning.

## Modified Capabilities

- `app-preferences`, `kana-study`, `spaced-repetition`: Restore transactionally and preserve corrupt originals.

# Impact

Expo application, local persistence, Supabase schema and authentication configuration.
