# Verification — 2026-10-21

The catalog and pure study logic pass focused automated coverage for 214 distinct cards, explicit aliases, exact normalization, shuffle membership, invalid/empty setup, duplicate grading, reveal scoring, mistake-only review, and original-selection repeat. Local storage tests cover hydration without writes, stale-ID cleanup, deliberate empty selection, malformed reads, ordered writes, and failure recovery.

Production browser checks covered mixed ten-card rounds without repeats, keyboard submission, duplicate-submit protection, 60% scoring, review and repeat, and selection restoration. First navigation to study works offline after selection loads. Reload starts a fresh round. Screenshots at 320px, 390px, and 1440px show no horizontal overflow, a 192px answer field, 44px targets, and one filled primary action in the study/results states. Palette contrast was calculated in both themes.

The full study flow passed on Android and in an earlier iOS run. The latest iOS replay after adding navigation passed single-card results/review and mixed-card grading before the XCUITest driver disconnected. Android back and restart persistence were checked separately. Native background/foreground and uninterrupted final iOS replay remain environment-limited; no physical-device or spoken screen-reader audit is claimed.

`pnpm check`, the 28-test integrated Jest suite, web export, and iOS/Android Hermes exports pass. OpenSpec strict validation passes. Detailed cross-platform evidence, storage-error injection, native keyboard correction, and limits are recorded in the companion `add-account-navigation/verification.md` archive.

The concurrent `add-spaced-repetition` change adds a separate scheduled mode and changes the home actions; native tests use Free practice. This change's transient free-study rules remain the baseline for that follow-up capability.
