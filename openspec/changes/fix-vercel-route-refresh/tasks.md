# Tasks

- [x] 1. Enable Vercel clean URLs for the existing static export.
- [x] 2. Verify exported primary, secondary and nested HTML documents; run `pnpm check` and OpenSpec validation.
- [ ] 3. Verify direct requests and refreshes on the production deployment after release.

Local validation: `pnpm build:web` generated 15 route documents including `profile.html`, `settings.html`, `practice.html` and `auth/callback.html`; `pnpm check` and strict OpenSpec validation passed. Production verification remains pending a deployment; keep this change active until that verification and archive it through OpenSpec afterward.
