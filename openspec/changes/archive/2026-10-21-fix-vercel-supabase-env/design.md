## Context

Vercel and a local export with dotenv disabled both fail on the client's missing-environment validation. The user requires actual Supabase configuration to remain outside GitHub, including branch history.

## Goals / Non-Goals

**Goals:** Supply build-time configuration through Vercel and remove committed values from branch history.

**Non-Goals:** Change client validation, authentication, UI, dependencies, or the unrelated kana-study change.

## Decisions

- Store `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` in Vercel for Production and Preview. Vercel requires Config visibility for public framework prefixes.
- Keep local values in ignored `.env.local`; commit only placeholders in `.env.example`. Ignore `.env` and `.env.*`, except `.env.example`.
- Amend the latest commit, the only commit containing the actual values. Push with an explicit lease against the previously verified remote tip, then scan a fresh remote clone's reachable objects for both values.
- Verify the replacement deployment and check the old commit URL independently of branch history.

## Risks / Trade-offs

Fresh deployments must configure both variables before building. Expo still embeds these public client values in distributed bundles. Rewriting Git history does not guarantee deletion of GitHub's cached or dangling commit pages; any remaining exposure must be reported and may require GitHub Support.
