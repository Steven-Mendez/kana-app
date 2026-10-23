## 1. Kana screen

- [x] 1.1 Remove the mode selector and state; Start always navigates with `mode: 'scheduled'` and shows the Smart review hint
- [x] 1.2 Remove unused `studyMode`, `freeHint` and `freePractice` strings and point the progress detail at duels instead of free practice

## 2. Verification

- [x] 2.1 Update the Kana screen test for the single mode
- [x] 2.2 Run `pnpm test`, `pnpm check` and `openspec validate remove-free-practice-mode --strict`
