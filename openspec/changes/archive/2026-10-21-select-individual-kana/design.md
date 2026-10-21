# Design

Store `{ alphabet, kanaIds }` under the existing selection key. Its explicit `kanaIds` field takes precedence over legacy `familyIds`, including when empty. Expand valid legacy families into stable glyph-based IDs on read, without writing during hydration; subsequent edits save the new shape. Glyph IDs keep same-reading characters distinct.

Adapt the source selector's individual cells and all-selected/otherwise-select-all family behavior using the existing universal Pressable components and semantic tokens. A separate 44-point family control in a secondary disclosure exposes unchecked/mixed/checked state; its sibling cells each have a minimum 44-point touch target, kana, reading, border and check cue. Preserve empty vowel columns at normal text size and reflow at enlarged sizes. No nested touch controls. The footer stays outside the scrolling table.

New study links use a `kana` parameter containing exact IDs. Legacy `families` links continue to expand families; a present invalid/empty `kana` parameter must not fall back to a wider family deck. Home uses the exact saved selection. Syllabary's explicitly named family action still selects every card in that family. Scheduled due filtering remains unchanged.

This request supersedes the whole-row-only selection design in the older active redesign-practice-page change. Its unrelated visual and footer work is retained.

## Category names

Use **Básicos / Tenten / Maru / Combinados** in Spanish and **Basic / Tenten / Maru / Combined** in English. These are editorial UI labels, not claims of standardized linguistic terminology. The second group contains characters with dakuten or handakuten (が, ぱ); the third combines an i-row character with a small ya/yu/yo (きゃ, しゅ). Básicos and Combinados describe the construction; the marked group uses the user-preferred colloquial Japanese names. Both Tenten and Maru are named so the p-series remains covered. Keep internal basic/voiced/yoon IDs stable.

Research: [Marc Bernabé, Japonés en viñetas, official sample](https://www.japonesenvinetas.com/wp-content/site_japonesvinetas/uploads/2016/10/Muestra-JeV1.pdf), hiragana lesson, explains the added marks and combinations. [Tae Kim's Spanish guide](https://guidetojapanese.org/spanish/hiragana.html) also illustrates both constructions. We use the construction descriptions, not that translation's inconsistent voiced/unvoiced terminology.

[Tofugu, Japanese Punctuation](https://www.tofugu.com/japanese/japanese-punctuation/) identifies dakuten as tenten and handakuten as maru.

## Consistency with Syllabary

Use Syllabary's existing rounded medallion styling in a shared KanaCell component, preserving its existing browsing behavior. Practice uses checkbox semantics and adds a subtle non-color check cue; Syllabary uses button/selected semantics. Keep exact glyph and reading hierarchy, surface fills, padding and responsive sizing shared. Remove rectangular card borders and row dividers from Practice. Match the text-led alphabet controls, retaining per-alphabet counts and separate accessible family bulk controls in a collapsed-by-default disclosure below the grid. The grid itself has no family headings, matching the Syllabary rhythm.
