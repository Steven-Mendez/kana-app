# Verification — 2026-10-21

- `pnpm test --runInBand`: 7 suites, 28 tests passed (Jest 30 / jest-expo 58 / RNTL 14). Covers existing domain checks, all FSRS ratings, graduation/relearning, interval progression, due order, UTC/DST equivalence, validated serialization, duplicate/uncertain writes, storage failure recovery, and native component interactions.
- `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm check`: passed. React Doctor reports five nonblocking warnings: two catalog-array lookups, two existing context values, and the study component's branching complexity. The review-load sequential-read warning was resolved with concurrent independent reads. No diagnostic suppressions were added.
- `pnpm build:web`: passed; static routes exported successfully.
- `openspec validate add-spaced-repetition --strict`: passed before archive.

## Browser

Used an isolated browser context with fresh local storage. Verified scheduled entry, correct-answer double-click producing exactly one Good log, results without immediate repeat actions, reload restoring the schedule, and the empty-due state with a locale-formatted next review. Simulated a storage quota failure on another kana: reveal produced Again, results stayed disabled until retry, and retry saved exactly one review. Also exercised the exported production bundle through its home-to-study flow; at 320px there was no horizontal overflow and active controls were 48px high.

An already-running development server had stale dependency resolution following the Jest install; a fresh Metro instance resolved it. Local verification used dedicated ports after an unrelated static server occupied the IPv4 address of an earlier port.

## Native

On the booted iOS 26.5 simulator and Android emulator using Expo Go, verified typed `nn` for ん, keyboard submission, correct feedback, saved-review feedback, results, and persistence after terminating and reopening Expo Go. Both platforms subsequently displayed no due reviews and the stored next due time.

Native smoke assertions used UI automation that has since been retired. The initial selection-scroll automation selected the wrong row on iOS, so scheduled review was entered through a direct study link. Automated cold-start link launching did not reliably reopen the intended route; native `simctl openurl`/`adb am start` commands and a warm study link were used before the final persistence assertions, which passed. These are historical split smoke checks, not a claim that the first end-to-end attempts passed unchanged or that their scripts remain in the repository.

Physical devices and release-native binaries were not tested. Review history remains device-local; one app instance serializes writes, but concurrent web-tab writers and large histories require transactional storage.
