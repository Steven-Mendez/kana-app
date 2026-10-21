# Design

Keep Expo Router's `web.output: static`. Set `cleanUrls: true` in `vercel.json` so `/profile` resolves `profile.html` and `/auth/callback` resolves `auth/callback.html`. Do not add a catch-all rewrite: each route already has its own HTML document and unknown routes must remain distinguishable.

Validate the static export and the Vercel configuration. After deployment, request and refresh `/profile`, `/settings`, `/practice` and `/auth/callback` directly. The callback must render even when no authorization code is provided; successful authentication is outside this hosting change.

Reference: https://vercel.com/docs/project-configuration/vercel-json#cleanurls
