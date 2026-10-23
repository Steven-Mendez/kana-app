## 1. Flames

- [x] 1.1 `Flame` `live` option: looping sway and stretch anchored at the base, off for reduced motion.
- [x] 1.2 Use the live flame in `StreakBadge` (`active`, `milestone`), the combo badge and the profile streak.
- [x] 1.3 `StreakBadge` `ignite`: flame pop, spark burst and count bump.

## 2. Combos

- [x] 2.1 Combo badge pops when the combo grows.
- [x] 2.2 New kitsunebi pop in at the progress bar head.

## 3. Results and meters

- [x] 3.1 Results sequence: grade, streak panel (ignited), scores staggered.
- [x] 3.2 `Meter` fills from empty and animates changes.

## 4. Correct feedback

- [x] 4.1 Card hop and tighter stamp; ribbon rises a few pixels; mascot pops from 0.6.
- [x] 4.2 Touch rounds wait for Continue after a correct answer; update the touch test and the study-loop spec.

## 5. Premium pass

- [x] 5.1 Shared motion tokens; `Burst` and `Rise` components.
- [x] 5.2 Hero card deal-in, staggered coins, wrong-card shake, mascot hop/shake, title pop.
- [x] 5.3 Combo burst, grade stamp slam with burst, staggered corrections, Home sections rise.

## 6. Verification

- [x] 6.1 Tests for the live flame and ignite props; existing game tests pass.
- [x] 6.2 Check a round and results in the web preview.
- [x] 6.3 `pnpm check` and tests; `openspec validate add-game-motion --strict`.
