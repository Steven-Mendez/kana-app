## 1. Fix

- [x] 1.1 Confirm Vercel's missing-variable failure and reproduce it locally.
- [x] 1.2 Configure Vercel Production and Preview variables as Config.
- [x] 1.3 Remove tracked environment values, strengthen ignore rules, and clarify the environment template.

## 2. Verification and delivery

- [x] 2.1 Export with dotenv disabled and externally supplied variables; verify ignore rules.
- [x] 2.2 Run `pnpm check` and validate this fix.

## Verification results

- Vercel deployment `9Khu9wNx6w9eujvxdnwUukhpqWSv` reports missing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` during static rendering.
- Export with dotenv disabled and both variables unset reproduces the same error.
- An isolated checkout without `.env.production` or local environment files exports successfully with externally supplied variables and dotenv disabled. Assertions verify the rendered home page and embedded configuration.
- Ignore-rule assertions cover `.env`, `.env.local`, `.env.production`, `.env.preview`, nested environment files, and the `.env.example` exception.
- Both variables are saved as Config in Vercel Production and Preview.
- `pnpm check` passes ESLint, TypeScript, formatting, and React Doctor; the change passes strict OpenSpec validation.

## Delivery procedure

Archive the validated fix and sync its specification. Amend the latest commit instead of adding a deletion commit. Scan the replacement history for both actual values, push with an explicit lease against the previously verified remote tip, then check a fresh remote clone, the replacement Vercel deployment, production page, and old GitHub commit URL. Report cached exposure separately from cleaned branch history.
