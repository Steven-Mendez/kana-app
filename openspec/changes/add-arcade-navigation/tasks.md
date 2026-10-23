## 1. Navigation

- [x] 1.1 Tabs layout renders a `Slot` on every platform; remove `NativeTabs`.
- [x] 1.2 Root stack hides native headers for all screens.
- [x] 1.3 Arcade bottom bar and wide top bar with platform icons, same test IDs.
- [x] 1.4 Back button on native secondary screens.
- [x] 1.5 Three tabs (Home, Kana, Profile); redirects from `/syllabary`, `/practice` and `/progress`; study and sign-in return to `/kana`.

## 2. Shared pieces

- [x] 2.1 Move `GamePanel`, `Eyebrow` and `Segment` to `src/components/game/`; add an arcade meter.
- [x] 2.2 `Action` wraps `GameButton`; `PageHeading` and `ProgressNotice` use the game look.

## 3. Screens

- [x] 3.1 Kana: tiles with FSRS state and selection, row checkboxes, detail sheet with strokes, coverage, bulk actions, bottom bar with mode and Start.
- [x] 3.2 Home: header with fox and streak, today's round, due review after history, duel only with a pair.
- [x] 3.3 Profile: identity, statistics, coverage, memory stages, account, legal links, gear to Settings.
- [x] 3.4 Settings, account and reset panels in the game look.
- [x] 3.5 Remove Syllabary, Practice and Progress screens and the unused catalog, cell, family tile, account links and progress components.

## 4. Verification

- [x] 4.1 `pnpm test` and `pnpm check` after the navigation step.
- [x] 4.2 Update Home, Kana and Profile tests; `pnpm test` and `pnpm check`.
- [x] 4.3 iOS simulator: every tab, Kana sheet and selection, Profile, Settings back, a round, light and dark.
- [ ] 4.4 Web at phone and desktop widths (desktop checked; phone width pending).
- [x] 4.5 `openspec validate add-arcade-navigation --strict`.

## 5. Comic style

- [x] 5.1 `Depth` draws a hard comic shadow down and to the right; panels gain captions and halftone; selected segments invert to ink.
- [x] 5.2 Comic title, caption, halftone and speech bubble pieces; Home greets in a bubble.
- [x] 5.3 Yōon glyphs fit the kana card.
- [x] 5.4 Soft line and shade tokens; `GamePanel` quiet by default and loud for results; soft captions; segments select with primary outline; buttons outline in their own edge color.
- [x] 5.5 Informative screens, app bar, navigation, sheet and kana board use soft lines; results and round pieces keep ink.

## 6. Calm layout

- [x] 6.1 Section label, divider, inline stat and skeleton pieces; dark theme outlines stay low contrast.
- [x] 6.2 Home: one hero panel for today's round, Start fixed at the bottom, goal, due, duel and alphabets as divided sections, skeleton loading.
- [x] 6.3 Profile and Settings: identity header, inline statistics, divided sections for alphabets, memory stages, account, appearance, language and data.
- [x] 6.4 Round: soft outlines on the card, coins, progress and input; answer actions in the lower third; finish as a text action.
- [x] 6.5 Results: grade and inline scores, streak celebration as the only highlighted container, corrections as a divided list.
- [x] 6.6 Tests, `pnpm check`, iOS light and dark.

## 7. Review fixes

- [x] 7.1 Shared: dark shade lighter than the canvas, ink token for loud pieces, neutral selected segments with selection haptic, sentence-case neutral text actions, quiet and destructive buttons, celebrate haptic, tab bar hidden on pushed screens.
- [x] 7.2 Results: Change selection on free rounds, actions pinned at the bottom, one streak score, success haptic and stamp entrance, fewer accents.
- [x] 7.3 Round: feedback ribbon pinned to the bottom, full-width keyboard action, no bar in endless rounds, single correction display, save retry in the ribbon.
- [x] 7.4 Kana: load error with retry, skeleton loading, neutral scrim, bottom bar order, lighter tiles, haptics.
- [x] 7.5 Home, Profile and Settings: accent limited to CTA and progress, type scale, empty and edge states, quiet admin actions, account actions trimmed.
- [x] 7.6 Tests, `pnpm check`, iOS light and dark.

## 8. Tab bar icons

- [x] 8.1 Illustrated Home, Kana and Profile icons in the arcade style, colored from theme tokens.
- [x] 8.2 Phone bar: icons only with accessible names, about 30-point icons, selected tab in a kitsunebi-outlined rounded square, 2-point top line; top bar keeps labels in the same shape.
- [x] 8.3 Web at phone width light and dark, `pnpm test`, `pnpm check`, `openspec validate add-arcade-navigation --strict`.

## 9. Consistency pass

- [x] 9.1 One button height everywhere; full-width primary buttons; disabled raised buttons keep their edge space.
- [x] 9.2 Only Home shows the app bar; other screens show a title (Profile starts with identity); the Profile avatar no longer repeats the fox.
- [x] 9.3 Kana tile press scale moved off the JS thread.
- [x] 9.4 Back button no longer reads the stack during render (stale focus warning); progress bar drops ignored animated-style dependencies.

## 9. Soft-ink tab icons

- [x] 9.1 Redraw Home, Kana and Profile as single-weight line icons: muted when unselected, primary with an accent fill when selected.
- [x] 9.2 Replace the kitsunebi square with a primary bar beneath the selected icon on the phone and top bars.
- [x] 9.3 Web at phone and desktop widths light and dark, `pnpm test`, `pnpm check`, `openspec validate add-arcade-navigation --strict`.
