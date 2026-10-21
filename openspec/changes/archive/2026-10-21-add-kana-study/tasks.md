## 1. Catalog and study rules

- [x] 1.1 Add the static hiragana/katakana catalog under `src/data/` with script-qualified card/family identities, the specified 107 cards per alphabet, canonical readings, and explicit aliases.
- [x] 1.2 Add pure study logic outside the routes for validating selected families, constructing shuffled rounds, normalizing/checking answers, and resolving each card once.
- [x] 1.3 Add focused colocated checks for catalog counts and identities, alias exceptions, blank/prefix rejection, one-card rounds, shuffle membership, and duplicate grading.

## 2. Selection and local preferences

- [x] 2.1 Add local selection storage using installed AsyncStorage, including hydration-before-save, valid empty selections, stale-ID filtering, malformed-data fallback, write ordering, and non-blocking failure handling.
- [x] 2.2 Replace the home placeholder with one Hiragana/Katakana selector, plain labeled sections, whole-family selection rows with kana/rōmaji previews, one set of visible-alphabet bulk actions, per-alphabet counts, and a safe-area-aware bottom start area with the combined count.
- [x] 2.3 Connect first-use defaults, preference restoration, and Start study, including a disabled action and explanatory empty state for zero cards.
- [x] 2.4 Verify mixed-selection preservation, scoped bulk actions, storage failure behavior, and restoration without overwriting saved preferences.

## 3. Study interaction and navigation

- [x] 3.1 Add `/study` and register it in the existing Expo Router stack; validate the selection snapshot and handle missing/invalid setup by returning to selection.
- [x] 3.2 Implement the large prompt, alphabet label, centered underlined Latin-text input, Check answer, secondary Reveal answer, compact progress/correct count, and persistent feedback using the specified single-column visual hierarchy.
- [x] 3.3 Implement Next and Show results with duplicate-event protection, input reset, and canonical answer correction.
- [x] 3.4 Implement Change selection/back behavior, in-process background preservation, and fresh-round behavior after reload or process restart; explain transient results in the UI.

## 4. Results and review

- [x] 4.1 Add a plain end-of-round summary with prominent rounded accuracy, correct/incorrect totals, and a simple missed-kana list with alphabets and canonical readings; apply the specified primary/secondary action hierarchy.
- [x] 4.2 Add Review mistakes, Repeat selection, and Change selection; retain the original selection separately from each review round and hide review when no mistakes exist.
- [x] 4.3 Add focused checks for reveal-as-incorrect, score calculation, review-only deck membership, fresh review counters, and repeating the original selection after review.

## 5. Cross-platform verification and completion

- [x] 5.1 Extend `src/global.css` with the specified warm palette and use consistent Tailwind typography/spacing, flat rows, and 8-pixel control corners. Verify text/indicator contrast, accessible labels/states, feedback announcements, visible keyboard focus, 44-pixel targets, enlarged text, and 320-pixel layouts with the software keyboard open. See verification.md for device and spoken screen-reader limits.
- [x] 5.2 Exercise selection → mixed study → correct/incorrect/reveal → results → review on web, iOS, and Android; check offline use after loading, keyboard submission, back navigation, reload, and single-card/empty states. See verification.md for the final iOS driver interruption and native backgrounding limit.
- [x] 5.3 Inspect screenshots of selection, study feedback, and results at 320px, 390px, and desktop widths against the documented minimalist design; check one filled primary action, bounded columns, unobscured bottom content, and absence of excluded controls.
- [x] 5.4 Run the focused checks, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm check`, and `pnpm build:web`; resolve failures and record any environment-limited checks.
- [x] 5.5 Run `openspec validate add-kana-study --strict` and reconcile implementation with every requirement and scenario before marking the implementation complete.
- [x] 5.6 After implementation and verification are complete, archive the change through OpenSpec to consolidate `kana-study` and the `app-structure` delta.
