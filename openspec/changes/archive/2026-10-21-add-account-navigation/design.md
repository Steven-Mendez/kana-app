## Context

The existing SDK 58 app has a selection route, a focused study route, semantic Uniwind tokens, and AsyncStorage selection persistence. The latest user clarification requests only the profile/login layout, not authentication.

## Goals / Non-Goals

**Goals:** A compact, warm cross-platform app shell; discoverable Practice, Profile, and Settings; persistent light/dark and Spanish/English preferences; fully localized study copy; preserved offline study.

**Non-Goals:** Authentication, editable account data, backend changes, historical statistics, additional languages, or a new UI dependency.

## Decisions

- Keep the existing root Stack and URLs. Shared screen chrome uses Expo Router links to `/`, `/profile`, and `/settings`. Navigation sits below content on phones and in a branded header above content from 768px. Stack navigation preserves platform/browser back behavior; no route relocation or second navigation library is needed.
- Hide global chrome in `/study` to keep the prompt and keyboard usable. Its existing Change selection action returns to the preserved deck configuration.
- Reuse house Pressable controls for the short appearance/language choices. They expose radio states and visible text; native platform styling libraries would add a dependency solely for four choices.
- Define dark tokens in `src/global.css` and switch with `Uniwind.setTheme`. Light is the first-use default. Local preferences hydrate before interactive UI, use validated values and ordered writes, and report nonblocking storage failures.
- Use a typed Spanish/English copy dictionary including dynamic messages and accessibility labels. Avoid a localization dependency for two fixed languages. Do not translate kana or accepted rōmaji.
- Profile shows guest status, local selection counts, a disabled sign-in control marked coming soon, and a working return to practice. No fake identity, statistics, password fields, or network calls.
- Keep the selection start action above bottom navigation, compact its spacing, and preserve scroll access, safe areas, 44px targets, and enlarged text wrapping.

## Risks / Trade-offs

- Storage can fail → keep changes active in memory, display a localized notice, and allow later saves to recover.
- Additional chrome reduces phone space → compact header/start area; hide navigation during study.
- Login is a visual placeholder → visibly label it unavailable and keep practice usable without an account.
- Theme and language hydrate asynchronously → show a neutral loading state instead of overwriting saved preferences or displaying interactive defaults.
