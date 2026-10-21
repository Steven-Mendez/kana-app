## 1. Implementation

- [x] 1.1 Keep input focus and implement interruptible correct advancement, manual Enter acknowledgement, and fresh restart drafts.
- [x] 1.2 Preserve exactly-once grading and scheduled persistence/retry guarantees including early typing and stale events.
- [x] 1.3 Update reducer/component tests and verify affected native interactions.

## 2. Verification

- [x] 2.1 Run pnpm test --runInBand, pnpm check (including pnpm lint and TypeScript), pnpm exec tsc --noEmit, pnpm build:web, and strict OpenSpec validation.
- [x] 2.2 Verify continuous input, correction/reveal, results/restart, and focus in Chrome and local iOS; save screenshots and actual results in verification.md.
- [x] 2.3 Consolidate the completed requirements and archive through OpenSpec.

## 3. Keyboard viewport regression

- [x] 3.1 Reproduce native clipping and investigate the literal undefined feedback using actual input and prior automation evidence.
- [x] 3.2 Fit the kana and answer area to the keyboard-reduced viewport without double keyboard accounting or changing continuous input/persistence behavior.
- [x] 3.3 Validate generated test input and verify native unanswered, incorrect, revealed, consecutive correct, final/results, scheduled-save states, large text and reduced height with screenshots and complete bounds.
- [x] 3.4 Re-run all Jest tests, pnpm check, web export and strict OpenSpec validation; record evidence and remaining limits for archival by the principal session.

## 4. Approved Real Kana interaction

- [x] 4.1 Auto-grade exact canonical/alias input matches; keep partial/wrong drafts editable; safely handle paste, accepted-prefix extensions, buffered typing and duplicate/stale events.
- [x] 4.2 Add confirmed-error → show-reading → continue stages with retained drafts, no hidden reading before reveal, localized controls, and exactly-once persistence/retry gating.
- [x] 4.3 Update reducer/component tests for automatic correct input and staged errors; verify consecutive native correct answers without Enter or input taps, keyboard bounds in both error stages, final/results/restart and save failures.
- [x] 4.4 Record the user's manual iPhone confirmation and respect removal of repository UI automation scripts; retain historical evidence and tool-agnostic native verification requirements.
