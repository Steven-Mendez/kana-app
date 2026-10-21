# Design

Use one CatalogContent container and CatalogControls component in both catalog routes. The controls render the web page heading, glyph-led alphabet choices (あ and ア), category capsules and vowel headers in the same order and spacing. Compact secondary selection badges in Practice preserve the same alphabet-control height as Syllabary. Accessible Practice alphabet labels retain counts. At large text both routes use identical stacked controls and hide vowel headers. No description precedes the controls in either route.

Keep native stack navigation. Settings and Profile scroll views opt into automatic safe-area adjustment; their headers explicitly use opaque themed backgrounds and the minimal back-button display mode. This handles the measured navigation bar rather than hardcoding a device-specific top offset. Do not disable the standard back gesture or long-press history menu. Verify first content, scrolling and back behavior in the iOS simulator, including enlarged text; compare DOM control bounds on web.

Alphabet choices retain a prominent Japanese glyph beside their label, with Practice counts in a small secondary badge. Both routes render the glyph and share the same sizing so character does not come at the expense of alignment.

## Direct row selection

Restore one-touch row selection with a visible 44-point checkbox at the start of each Practice row, preserving individual cell checkboxes as siblings. Replace the hidden family disclosure. At 320-point width, a 48-point leading column plus five 48-point cell slots leaves 44-point cell targets after 2-point side padding. Vowel headers receive the same leading gutter. No row names or extra headers are added.

## Round cells and desktop layout

Kana medallions must be circles, with a 1:1 aspect ratio instead of independent minimum height and full width. On desktop web, cap the diameter at 64 logical pixels and split categories of six or more rows into two reading blocks, each with its own vowel headings. Keep the row order top-to-bottom within each block. Combine the compact alphabet and category groups into a horizontal desktop toolbar. Apply desktop changes only on web at 1024 pixels and above; preserve the approved native/phone structure.
