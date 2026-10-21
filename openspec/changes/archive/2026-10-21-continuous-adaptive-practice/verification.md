# Verification

- `pnpm test --runInBand`: 11 suites, 65 tests passed.
- `pnpm check`: lint, TypeScript and formatting passed. React Doctor reports four existing maintainability/context warnings; no new warning from this change.
- `pnpm build:web`: production web export succeeded with isolated local test environment values.
- Web UI: three selected kana continued through nine attempts in varied order and displayed results only after Finish practice.
- Final production export: one selected kana accepted twenty consecutive correct answers; the first updated FSRS and the next nineteen displayed practice-only feedback. A subsequent reveal updated FSRS. Manual finish showed 21 attempts, 20 correct, one incorrect and 95% accuracy. Progress showed exactly two saved reviews.
- Free practice: a single selected kana continued for three answers, finished manually with 100% accuracy, and retained the existing saved-review count.
- Retry, pending-save finish gating, stale handlers for repeated characters, random first prompts, weighted frequencies, due boundaries, restored future-due cards, mistake drill reset and free-practice isolation are covered by automated tests.
- Scope: clean worktree based on `cfe8c29`; no authentication, Supabase migration, provider, package or lockfile changes included.
