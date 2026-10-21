# Tasks

- [x] 1. Create the private schema, catalog, RLS and service-only RPC permissions; generate Database types.
- [x] 2. Implement Apple, Google, email OTP, session restoration, callbacks, profile and identity linking.
- [x] 3. Verify callback idempotency, Apple nonce/state, OTP errors, local sign-in and RLS isolation.
- [x] 4. Document credentials, redirect URLs, SMTP, secret renewal and release prerequisites.
- [x] 5a. Verify real Google web access, PKCE return and synchronized profile on the production domain.
- [ ] 5b. Validate native Google and, before enabling them, Apple and provider linking in development builds.

- [x] 6. Enable Google and guest access by default, independently gate Apple/email UI and service calls, and verify production Google access without SMTP.

Local verification is recorded in `docs/supabase-setup.md`. Keep this change active until its release verification is complete, then archive through OpenSpec.

- [x] 7. Publish public privacy and terms pages, link them from home/access and complete Google branding.
