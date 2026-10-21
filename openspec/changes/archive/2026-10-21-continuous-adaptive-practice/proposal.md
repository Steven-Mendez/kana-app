## Why

Practice currently stops after one ordered pass and excludes selected kana whose review date is in the future. The learner wants to decide when to stop, with intelligent review influencing frequency rather than eligibility.

## What Changes

- Make free and intelligent practice continuous until an explicit Finish action.
- Sample selected kana randomly; intelligent sampling weights difficulty, elapsed time, due dates and recent mistakes, updating after every saved answer.
- Preserve due-only dashboard scope, local persistence, retries and free-practice isolation.
- Keep early successful drills out of FSRS history while retaining new/due reviews and early failures. Use ts-fsrs recall probability to weight sampling.
- Show cumulative answer counts and user-ended results instead of a finite progress bar.

## Capabilities

### Modified Capabilities

- `kana-study`: continuous sessions and explicit completion.
- `spaced-repetition`: weighted selection and early repeated reviews.
- `study-overview`: due snapshot becomes the continuous session pool.

## Impact

Study domain, session UI, localized copy, review storage and tests. No dependencies, schema, authentication or Supabase integration changes.
