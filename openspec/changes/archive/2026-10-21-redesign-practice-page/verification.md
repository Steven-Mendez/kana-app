# Practice redesign — Stitch direction verification, 2026-10-21

This report covers the new medallion/matrix implementation and footer-local mode control. Earlier two-/three-column tile screenshots and passing runs are superseded and are not evidence for this version.

## Implemented

- Ivory, white, warm beige, near-black, and deeper vermilion semantic colors; contrasting dark palette retained. Shared actions have capsule corners.
- Compact introduction and segmented alphabets, category capsules, five-vowel family rows with circular kana medallions and YA/WA gaps. Yōon has three columns; N remains a separate family. Entire rows are checkboxes, with checkmarks and selected rings.
- Mode selection is beside Start. Both explanations open above the summary, in a bounded scrollable footer. Selecting a mode closes the disclosure and restores web keyboard focus. Empty selection disables Start. Enlarged native text reflows pairs rather than shrinking or truncating them.
- Updated localized instructions and family/mode component coverage; verified Practice/study interactions on native.

### Follow-up: remove redundant introduction

Removed the entire “Elige tus kana” introduction card and its unused Spanish/English copy following user feedback. Practice now starts directly with alphabet selection. The earlier screenshots below predate this removal. The existing selection interaction test passed after removal (`pnpm test --runInBand src/components/selection-screen.test.tsx`).

## Automated checks

- `pnpm test --runInBand`: passed, 8 suites / 29 tests. Existing Watchman recrawl warning remains.
- `pnpm check`: passed ESLint, TypeScript, Prettier, and React Doctor. Six nonblocking Doctor warnings remain: Practice size/complexity, study-session complexity, two provider values, and the family membership lookup inside the press callback. No suppression or unrelated refactor added.
- `pnpm build:web`: passed, nine static routes exported.
- `openspec validate redesign-practice-page --strict`: passed.
- Initial checks caught a test fixture with enlarged default font scale, an incorrect React Native 0.88 ref type, and test formatting. Those were corrected before the passing runs.

The selection test checks whole-family toggling, YA/WA vowel positions, mixed alphabet/category counts, alphabet-wide bulk actions, both routing modes, closing without changing mode, and disabled empty selection. It also verifies the mode control is inside the footer.

## Web

Development server `http://localhost:8081`, Chrome page 29.

- Exercised 5 → 10 → 13 → 117 → 10 → empty selections, recovery, and whole YA-family toggling. Verified both alphabets, all categories, and correctly empty vowel cells.
- Opened/closed mode options, chose free practice, started a five-card round, and returned with five selected. Scheduled mode entered the existing due-card flow (the current browser data reported nothing due) and returned correctly.
- Reloaded an eight-card mixed selection and confirmed both the count and last visible Katakana alphabet persisted.
- Inspected Spanish/light and English/dark at 320px, 390px, and 1440px. No horizontal overflow in measured states. The matrix is centered in a maximum 672px region within the specification's 896px cap.
- At 320px with browser root text set to 200%, kana pairs wrap. The footer initially exceeded available height when expanded; bounding and scrolling the complete footer fixed the overlap with navigation. Mode choices and Start remain reachable by scrolling. This is browser text enlargement, not native Dynamic Type.
- Exercised Enter and Space family toggling, repeated-key prevention, Space mode selection, and focus restoration. Real Enter presses toggled the vowels and disabled/re-enabled Start. The family had a visible 2px keyboard outline at standard text size (3px during the enlarged-text check). Accessibility roles, selected/checked/expanded/disabled states and the live count were inspected; spoken screen-reader output was not tested.
- No browser console errors or warnings in the final inspected navigation.
- Calculated contrast: light secondary text 5.34:1; light primary text 5.63:1; light selected ring 4.80:1; dark secondary text 7.61:1; dark primary text 7.13:1; dark ring 5.34:1.

## iOS

The automated runs below are historical evidence. Their repository scripts have since been removed at the user's request; current verification uses the maintained Jest tests and direct browser/simulator interaction.

Local simulator `D14E6CB0-4CF7-4A31-837F-B72DB503E8A3`, iOS 26.5, bundle `com.stevenmendez.kanaapp`.

### Standard text

The retired Practice automation passed end to end in the 2026-10-21 12:50:04 run. It covered both alphabets, basic/voiced/yōon categories, 5 → 10 → 13 → 117 → 10 → empty counts, disabled Start, recovery, the mode disclosure and cancellation, free start/return, dark appearance, scheduled entry, hidden study tabs, and return to light appearance. Its light, dark, mixed, mode, and empty screenshots were inspected.

Initial runs exposed the automation's visibility/centering behavior around the fixed native header/footer: it identified controls behind those regions as visible, so taps missed Select all or the Hiragana tab. Explicit content-region swipes were added after scrolling. Those failed runs were saved under the artifact root, and are not counted as passes.

The retired study automation also passed end to end in `study/2026-10-21_125840/study/`: empty selection, standalone N in both alphabets, one-/two-card free rounds, keyboard submission, blank feedback, aliases, reveal, 100%/0%/50% results, mistake review, repeats, bulk selection, and returning to the preserved selection. The aggregate app flow was not rerun; its Practice and study child flows were run individually.

### Enlarged native text

Set simulator content size to `accessibility-extra-large`. Inspected stacked alphabet/category controls, reflowed vowel and compound-kana medallions, readable rōmaji, and the mode options. The footer's initial side-by-side layout squeezed the mode label, so the enlarged-native-text footer now stacks its contents.

The first automation required 100% visibility for an entire family taller than the viewport and failed. The adjusted run in `large-text-final/2026-10-21_125543/large-text/` passed vowel selection, disabled empty Start, recovery, and five-card start/return, but missed the oversized mode option and later failed while looking for the category control. Its mode-choice step is not counted as verification.

The targeted continuation `large-mode-yoon.yaml` passed completely in `large-targeted/2026-10-21_125754/large-mode-yoon/`. It explicitly swipes inside the footer and taps the visible part of the oversized option, verifies the options closed and the current mode is Free practice, starts/returns from five cards, selects KYA, verifies eight cards, and starts/returns from the eight-card free round. Screenshots show readable compound kana and the full mode explanation while scrolling. The original combined large-text flow did not pass uninterrupted; the targeted continuation did. Simulator content size was restored to `large` afterward.

## Artifacts and scope

Artifact root:

`/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/kana-practice-stitch/`

Browser captures: `web-final-light.png`, `web-320-light.png`, `web-320-modes.png`, `web-320-dark-yoon.png`, `web-320-empty-focus.png`, `web-320-text-200.png`, `web-wide-light.png`, `web-wide-dark.png`.

Native evidence: `ios-final-light.png`, `ios-final-dark.png`, `ios-large-yoon.png`, the standard-text run's `takeScreenshot/` directory, and the targeted large-text run's `ios-large-free-option.png`. Temporary artifacts describe the original runs; they are not maintained repository scripts or a supported rerun command.

The final `restore.yaml` flow passed. iOS and Chrome were left in Spanish/light appearance, basic Hiragana, five vowels selected, scheduled mode, and normal text size. The final light screenshots were inspected after restoration.

No dependencies, catalog identities, FSRS logic, or storage implementation changed. Existing staged/unstaged work was preserved. No commit, push, or archive performed; archival belongs to the principal agent.

Not verified: Android runtime, physical devices, Safari, spoken VoiceOver/TalkBack, or native 320px hardware. Browser testing supplies the 320px coverage.

## Archival reconciliation (2026-10-21)

This completed redesign is archived with `--skip-specs` because its original palette and whole-family-only matrix were superseded by the already consolidated `apply-app-design-tokens`, `select-individual-kana` and `align-catalog-and-account-headers` changes. The current kana-study and app-design-system specifications retain the latest approved colors, individual cells, direct row checkboxes, exact circles, desktop layout and shared catalog controls. Reapplying this historical delta would revert those requirements. This note records supersession rather than treating historical screenshot results as a new run.
