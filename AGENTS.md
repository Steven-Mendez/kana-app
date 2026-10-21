# Project guidelines

Expo / React Native app. Prioritize mobile-first design, performance, and cross-platform compatibility.

## Development

- Before using Expo, EAS, or React Native APIs, read the Expo version in `package.json` and fetch `https://docs.expo.dev/versions/v<major>.0.0/`. Find other current docs through `https://docs.expo.dev/llms.txt`; do not rely on memory.
- Use the pnpm version pinned in `package.json`. Install dependencies with `pnpm exec expo install <package>` and include `pnpm-lock.yaml` changes.
- Reuse existing tools. Prefer popular, maintained, compatible tools and recommended Expo modules. Check relevant skills before adding dependencies; avoid duplicate tooling.
- Use Expo Router for navigation. Keep routes in `src/app/`, navigators in `_layout.tsx`, and non-route code outside `src/app/`. Import navigation APIs from `expo-router`.
- Configure generated `ios/` and `android/` projects through `app.json` and config plugins, not manual edits. Native modules outside Expo Go require a development build.
- Use `pnpm dlx eas-cli@latest <command>` for cloud builds, signing, submissions, and OTA updates.

## Commands

```bash
pnpm install --frozen-lockfile # install dependencies
pnpm start                    # development server
pnpm check                    # ESLint + TypeScript + formatting + React Doctor
pnpm lint:fix                 # fix lint issues
pnpm format                   # format files
pnpm dlx expo-doctor           # SDK and dependency compatibility
pnpm build:web                # export to dist/
```

## Quality

- Run `pnpm check` before finishing a task.
- Git hooks: pre-commit fixes staged files with ESLint and Prettier; pre-push runs `pnpm check`.
