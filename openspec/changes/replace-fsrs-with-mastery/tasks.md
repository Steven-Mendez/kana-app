## 1. Domain

- [x] 1.1 Add `kana-mastery.ts` with the mastery fold, due rules, review queue and tests
- [x] 1.2 Replay events into v2 progress, accept legacy and `mastery-v1` events, rebuild v1 documents on read
- [x] 1.3 Replace FSRS in progress summary, board tiles and practice weights; remove `spaced-repetition.ts` and `ts-fsrs`

## 2. Study and screens

- [x] 2.1 Save every Smart review answer and show the new mastery level after saving
- [x] 2.2 Show mastery on tiles, the kana sheet and Profile stages; update copy

## 3. Sync

- [x] 3.1 Add the Supabase migration and update the Edge Function

## 4. Verification

- [x] 4.1 Update tests; run `pnpm test`, `pnpm check` and `openspec validate replace-fsrs-with-mastery --strict`
