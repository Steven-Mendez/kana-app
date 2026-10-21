## 1. Scheduler and tooling

- [x] 1.1 Install pinned ts-fsrs and compatible Jest/jest-expo/RNTL dependencies; configure Jest and migrate existing domain tests.
- [x] 1.2 Add the pure scheduler, binary rating mapping, date validation, and due-queue selection with unit tests.

## 2. Persistence

- [x] 2.1 Add versioned per-card state/log serialization and validated loading without overwriting corrupt data.
- [x] 2.2 Add serialized, idempotent review commits and tests for retries, ordering, invalid records, and UTC round trips.

## 3. Study integration

- [x] 3.1 Add scheduled entry/route loading with due-first queues, loading/error/empty states, and next-due display.
- [x] 3.2 Reuse study interaction for immediate commits, duplicate prevention, saving/retry feedback, and scheduled completion; preserve free practice isolation and localize copy.
- [x] 3.3 Add RNTL interaction tests for submit, reveal, blanks, duplicate actions, failed saves/retries, and free-practice behavior.
- [x] 3.4 Reconcile active study documentation to distinguish transient free practice from durable scheduled history.

## 4. Verification

- [x] 4.1 Run pnpm test, pnpm lint, pnpm exec tsc --noEmit, pnpm check, and pnpm build:web; resolve change-related failures.
- [x] 4.2 Exercise available runtime/platform smoke checks and record any environment limitations.
- [x] 4.3 Validate specifications, complete tasks, and archive this change through OpenSpec.
