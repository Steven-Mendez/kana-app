## ADDED Requirements

### Requirement: Access supports three providers

The app SHALL offer Google sign-in and guest study by default, retain independently opt-in Apple and email OTP implementations, preserve cancellation, restore sessions, and support linking enabled identities only from an authenticated account.

#### Scenario: A learner cancels OAuth

- **WHEN** a learner cancels oauth
- **THEN** Guest progress remains unchanged and the learner can retry.

### Requirement: Data belongs to one account

Personal tables SHALL enforce RLS and explicit grants; clients SHALL NOT directly write canonical progress or review events.

#### Scenario: A user requests another user’s data

- **WHEN** a user requests another user’s data
- **THEN** No private rows are returned and writes are rejected.

### Requirement: Access is recoverable across platforms

Email access SHALL send and verify codes without passwords, expose resend limits and invalid/expired-code errors, and retain user input after failure. Native Apple access on iOS SHALL hash a fresh nonce for Apple, exchange the raw nonce with Supabase, verify returned state and preserve the initial name. Browser access SHALL use PKCE with explicit environment callbacks and deduplicate code exchanges. Identity linking SHALL use the authenticated Supabase identity API and never merge accounts by client email comparison.

#### Scenario: A code expires

- **WHEN** Supabase rejects an expired or invalid email code
- **THEN** the user can request another code after the resend delay without losing guest progress

#### Scenario: A callback arrives twice

- **WHEN** the browser return and router callback deliver the same authorization code
- **THEN** they share one exchange operation and only a failed exchange can be retried

#### Scenario: Apple provides a private email and initial name

- **WHEN** native Apple returns a matching state and identity token
- **THEN** Supabase verifies the token with the raw nonce and the app preserves the available name without requiring a public email

#### Scenario: Linking finds an identity on another account

- **WHEN** Supabase rejects an identity link because it already belongs to another account
- **THEN** the app displays the conflict and neither account's learning data is moved

#### Scenario: Restore credentials while offline

- **WHEN** session refresh fails and validated local account ownership is available
- **THEN** the account's offline workspace remains accessible and server access still requires a verified session

### Requirement: Production access does not require SMTP

Google sign-in SHALL be enabled by default unless `EXPO_PUBLIC_ENABLE_GOOGLE_AUTH` is false. Apple and email OTP SHALL remain hidden and blocked unless their respective `EXPO_PUBLIC_ENABLE_APPLE_AUTH` and `EXPO_PUBLIC_ENABLE_EMAIL_AUTH` flags are true. Provider flags SHALL also govern identity linking and service calls. OAuth callbacks SHALL be available when at least one social provider is enabled. Disabling a method SHALL NOT erase an existing session or local progress.

#### Scenario: Default production access

- **WHEN** a learner opens access with the default configuration
- **THEN** Google and guest study are offered, without Apple or email input

#### Scenario: A disabled method is invoked directly

- **WHEN** code attempts to launch or link a disabled provider or send/verify a disabled email code
- **THEN** it is rejected before calling Supabase or the native provider

### Requirement: Public privacy and terms information

The app SHALL expose Spanish and English privacy and terms pages at `/privacy` and `/terms`, readable without signing in or initializing local learning storage. Home and sign-in SHALL link to both. Privacy information SHALL explain identity data, learning data, local storage, service providers and deletion requests. Terms SHALL explain the educational service and acceptable use without promising uninterrupted availability.

#### Scenario: Read information before signing in

- **WHEN** a visitor directly requests either legal page, including without JavaScript
- **THEN** the exported HTML contains its text and contact information without requiring a session
