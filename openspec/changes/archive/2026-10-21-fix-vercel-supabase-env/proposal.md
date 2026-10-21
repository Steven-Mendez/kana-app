## Why

Vercel deployment `afb74bb` fails during static rendering because the Supabase variables exist only in ignored `.env.local`. Cloud builds need deployment-provided configuration, while actual project values must stay out of GitHub and its branch history.

## What Changes

- Configure both Supabase variables in Vercel as Config for Production and Preview.
- Remove `.env.production`, ignore environment files except `.env.example`, and document deployment configuration.
- Verify production export using externally supplied variables.
- Rewrite the affected latest commit, push with an explicit lease, and inspect both remote history and the old GitHub commit URL.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `supabase-client`: Require deployment-provided configuration without committing project values.

## Impact

Touches Vercel environment settings, environment files, ignore rules, this change's documentation, the Supabase specification, and the latest commit's history.
