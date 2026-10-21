## Why

Kana practice currently forgets every result when a round ends. Learners need durable, device-local review scheduling to revisit kana when recall needs reinforcement.

## What Changes

- Add scheduled review alongside free practice, using the official pinned `ts-fsrs` scheduler.
- Map correct answers to Good and wrong/revealed answers to Again; support all four ratings in the scheduler service.
- Persist per-kana scheduling state and complete review logs locally with UTC timestamps, validation, serialized writes, and retry-safe review identities.
- Show due cards before unseen cards, and provide loading, storage-error, and nothing-due states.
- Keep free practice and immediate mistake drills outside scheduling; clarify transient round scores versus durable scheduled progress.
- Use Jest, jest-expo, and React Native Testing Library for unit and interaction verification.

## Capabilities

### New Capabilities

- `spaced-repetition`: Local FSRS scheduling, review persistence, due queues, and scheduled-study interactions.

### Modified Capabilities

None of the consolidated capabilities change. The active `add-kana-study` specification will clarify that its transient-history requirement applies to free practice; scheduled review is governed by this capability.

## Impact

Adds scheduler and review-storage modules in `src/lib/`, a scheduled-session loader, tests, and a scheduled entry on selection. Integrates with the study route/session and localized copy from the active account-navigation work. Adds ts-fsrs and test tooling with lockfile updates. No Supabase schema changes or authentication dependency.
