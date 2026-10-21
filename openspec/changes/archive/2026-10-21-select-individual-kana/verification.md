# Verification — 2026-10-21

## Implementation

Individual kana IDs now drive selection, local preferences, Home resume and new study URLs. Legacy family preferences and links still expand correctly. No changes to saved review history. Practice and Syllabary share KanaCell styling. The continuous grid has no family headings; a secondary disclosure retains family bulk controls and partial state. Category labels are Básicos, Tenten / Maru, Combinados (English: Basic, Tenten / Maru, Combined). The Home daily announcement was removed.

## Automated

- `pnpm test --runInBand`: 10 suites, 55 tests passed. Coverage includes legacy migration, intentionally empty preferences, malformed/stale IDs, same-reading distinct kana, exact individual decks, partial-family toggles, scoped bulk actions, persisted remount, Home resume, Syllabary shortcuts and typing/scheduling regressions.
- `pnpm check`: passed ESLint, TypeScript and formatting; React Doctor reports six pre-existing maintainability/context-value warnings. No new warnings.
- `pnpm build:web`: 13 routes exported.
- Strict OpenSpec validation and archival performed for this change.

## Browser verification

Local development web at localhost:8091, 1456 × 853 viewport:

- Legacy five-vowel selection restored. Deselecting い changed total to four and family state to mixed. Space completed the family; another toggle cleared it and disabled Start.
- Mixed selection of い and キュ persisted across category/alphabet navigation and reload. Selecting all Katakana produced 108 total; clearing Katakana retained exactly the one Hiragana card.
- A one-card free round showed only い, accepted `i` and completed at 100%, 1 correct. Home resume also passed exactly one card to scheduled mode without grading it.
- Shared medallions support keyboard Space; the family disclosure starts collapsed, exposes mixed state, completes a partial family, and closes again.
- Final grid: 46 basic checkbox cells, minimum measured target 116.8 × 80 CSS pixels on this desktop viewport. Family names are absent from the grid.
- Home no longer contains the daily announcement. Category labels match between screens.

## iOS simulator verification

Expo Go, Kakareta Demo, iOS 26.5:

- Legacy three-card combined-family selection restored. Tapping a single kana produced 2/3 mixed state; the family control selected 3/3, then cleared the deck and disabled Start.
- One kana (い) selected independently; free practice started at 0/1. Tapping `i` on the software keyboard completed the round with 1 correct, 0 incorrect, verified in the native accessibility tree.
- Syllabary's family shortcut opened Practice with all five family members selected.
- Text Size increased from 3 to 5: controls and footer reflowed and remained readable; restored to 3 afterward.
- Terminated/reopened Expo Go: Home restored only い and the count of one; returning to Practice retained that selection.
- Final shared grid and category labels inspected in dark mode. Browser inspected in light mode. Android was not exercised in this task.

## Evidence

Screenshots are local artifacts outside the repository:

- [Final web grid](/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/individual-kana/web-final-light.png)
- [Final iOS grid](/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/individual-kana/ios-final-dark.png)
- [Enlarged iOS text](/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/individual-kana/ios-large-text.png)
- [Web one-card results](/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/individual-kana/web-one-kana-results.png)
- [iOS Syllabary comparison](/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/individual-kana/ios-syllabary-dark.png)

No repository UI automation scripts, new dependencies or commits were added. Existing staged work was preserved. Older active changes remain separate; this change supersedes their whole-row-only selector requirement.
