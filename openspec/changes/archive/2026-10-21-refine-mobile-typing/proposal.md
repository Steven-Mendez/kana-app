## Why

The app is mobile-first and focused exclusively on typing. The original implementation offers useful focused prompt, stable feedback, session streak, and correction-summary patterns that can improve the existing native study loop.

## What Changes

- Adapt a cardless typing prompt with semantic success/error colors and a centered input whose position stays stable through feedback.
- Reserve feedback space and the submit affordance footprint so grading does not shift the input or kana at standard phone text sizes.
- Extract focused prompt, feedback, and progress components while preserving continuous input and exactly-once persistence.
- Show current consecutive correct answers and best streak for this round, derived from immutable grades, plus submitted-answer corrections in results.
- Verify typing, correction/reveal, completion, restart, both themes, and keyboard reachability on local iOS and web.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kana-study`: mobile typing presentation and transient session feedback/results.

## Impact

Study components, localized copy, derived round statistics and interaction tests. Existing semantic tokens, selected-family storage and scheduling remain the source of truth. No handwriting, canvas, countdown pressure, new dependencies, or backend changes.
