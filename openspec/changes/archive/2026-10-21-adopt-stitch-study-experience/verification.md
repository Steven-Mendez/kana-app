# Verification — 2026-10-21

## Implementation

Adapted the supplied Stitch composition into Home, Syllabary, Practice, and Progress. Reused the existing fox logo and Kana name. Kept the existing practice engine, semantic light/dark colors, and local storage formats. No packages added.

## Automated checks

- Jest: 49 tests across 10 suites, including progress boundaries, unique local-day counts, due-only snapshots, absent-progress exclusion, loading/error retry, explicit family selection, and existing continuous input/persistence coverage.
- pnpm check: ESLint, TypeScript, formatting, and React Doctor. React Doctor retains seven warnings in pre-existing practice/session/provider logic (component size/complexity, lookup in a loop, provider values); the gate exits successfully.
- pnpm build:web: static export includes all seven application routes and Router support routes.
- Strict OpenSpec validation and git diff --check.

## Browser inspection

Used the current Metro server on localhost:8081. The older server on 8082 had a stale Jest resolution error and was not changed.

- Home at desktop width and 390×844: existing fox logo, primary action, alphabet coverage, navigation.
- Syllabary at 390×844 and 320×740: readable matrix, fixed reading/action area, five columns without horizontal clipping, dark palette and current selection.
- Katakana シ inspection → Practice this family → exactly katakana:sa selected on Practice.
- Progress at 320×740: statistics wrap, first-use counts remain zero, all actions scroll within the available area.
- Restored the browser's light theme and initial vowel selection after testing. Reset viewport override.

## Native inspection

Expo Go 58.0.5 on the local iOS 26.5 simulator, controlled through Device Hub.

- Home renders the existing logo and four native tabs.
- Syllabary yōon stays readable with the Text Size setting increased from 3 to 5; restored to 3 afterwards.
- Practice this family opens the matching yōon category with exactly three cards selected. Footer remains above the native tab bar.
- Completed きゃ → きゅ → きょ via the native text field, observing automatic advancement, 100% results, saved review confirmation, and return to the preserved selection.
- Switching to Progress shows 3 studied, 3 reviewed today, 3 saved reviews, 211 unseen, and 0 due. This verifies refresh after a real saved session.
- Restored keyboard capture to off. Screenshots are outside the repository; no UI automation scripts were added.

## Evidence

- `/Users/wern/.codex/visualizations/2026/10/21/01a16006-a35f-7b20-a40a-d92275388000/kana-home.png`
- `/Users/wern/.codex/visualizations/2026/10/21/01a16006-a35f-7b20-a40a-d92275388000/kana-ios-progress.png`

## Limits

Android was not run interactively. Native keyboard entry was exercised through the accessibility text field with the hardware keyboard; software-keyboard layout was not reverified because its measured layout is unchanged. Drawing, audio, multiple-choice quizzes, streaks, and XP are outside this adaptation. Counts report actual studied coverage, not inferred mastery or retention.
