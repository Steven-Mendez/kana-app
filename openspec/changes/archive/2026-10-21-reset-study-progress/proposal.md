## Why

Learners need an explicit way to discard their saved study history and start again. Reset selection currently changes only selected kana.

## What Changes

- Add a separate Reset all progress control in Settings, with a localized confirmation and cancel action.
- Delete FSRS state and review logs for both alphabets on this device while retaining selection and appearance/language preferences.
- Serialize reset with review operations and recover interrupted deletion before reading or writing progress.

## Capabilities

### Modified Capabilities

- `app-preferences`: confirmed progress reset from Settings.
- `spaced-repetition`: complete, retryable local history reset.

## Impact

Settings, a focused reset component, review storage, localized strings and tests. Applies to the currently published local storage architecture. Uncommitted Supabase/account work is outside this change; integrating this feature with account synchronization will require an account-scoped remote reset before enabling it there.
