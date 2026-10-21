# Tasks

- [x] 1. Enable Vercel clean URLs for the existing static export.
- [x] 2. Verify exported primary, secondary and nested HTML documents; run `pnpm check` and OpenSpec validation.
- [x] 3. Verify direct requests and refreshes on the production deployment after release.

Local validation: `pnpm build:web` generated 15 route documents including `profile.html`, `settings.html`, `practice.html` and `auth/callback.html`; `pnpm check` and strict OpenSpec validation passed. Production deployment `0ff5e03` verified: direct requests return 200 for `/practice`, `/profile`, `/settings`, `/auth/callback`, `/privacy` and `/terms`; an unknown path returns 404. The real Google callback returns to a synchronized profile and browser refresh restores the account.
