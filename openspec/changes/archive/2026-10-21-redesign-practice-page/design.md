## Context

The previous change addressed native navigation and study but left Practice as an oversized form. This revision focuses exclusively on the whole Practice page.

## Decisions

- Lead directly with the capsule-shaped alphabet segment, without a redundant introduction card or “Choose your kana” heading. Its glyphs and counts refer to the entire alphabet, not the visible category.
- Make kana the main content: one named family per row, with five aligned A/I/U/E/O columns and circular white kana medallions with readings below. Preserve gaps for YA and WA; the standalone N is separate from vowel alignment. Yōon uses three A/U/O columns so compound glyphs stay readable. A row is one checkbox; tapping any medallion selects its entire family. Selected rows have a check, a quiet tint, and vermilion medallions with a ring.
- Keep the matrix centered at a comfortable reading width inside the existing maximum page width. Enlarged native text reflows kana pairs and drops empty placeholders; browser text enlargement can also wrap pairs without clipping. No individual-kana selection is introduced.
- Place Select all/Clear after the grid with an explicit alphabet label. Keep their existing alphabet-wide semantics, including hidden categories.
- Keep the combined count, active mode disclosure, and capsule Start in the fixed footer. The mode control sits at the decision point, outside the header. Opening it reveals both explanations immediately above the summary; choosing a radio option closes it and returns keyboard focus to the disclosure. The same control closes it without changing mode. Default remains scheduled. This in-place disclosure reuses existing Pressable controls rather than adding a sheet dependency or route; it does not trap focus or obscure content with an overlay. Bound the complete footer to 55% of viewport height and allow it to scroll when enlarged text or expanded options require more room. This prevents the options and Start from being clipped by navigation; the collapsed standard-text footer remains content-sized.
- Reuse Action, Icon, Screen, theme tokens, and selection storage. Rename FamilyRow to FamilyTile rather than retaining a dead component.
- Use a warm near-black foreground, deeper red primary, ivory background, white surfaces, beige secondary controls, and generous rounded corners from semantic tokens in global.css. Dark mode retains warm surfaces and a contrasting coral-red accent. Shared action corners become capsules for visual consistency.
- Above a native font scale of 1.2, stack alphabet/category controls and bulk actions, and reflow kana pairs. Mode explanations belong to the expanded choices, where both options can be compared before choosing.

## Risks

- A five-column matrix can crowd glyphs at 320px: use the whole row width, restrained gutters, and large-text reflow; verify both. Yōon needs three columns rather than squeezed compounds in five.
- Moving controls changes automation targets: update tests to open the mode disclosure and scroll to bulk actions deliberately.

## Verification

Preserve the mixed-category/alphabet and mode-routing interaction test. Verify default, empty, mixed, category, dark, 320px, enlarged text, and start/return states in web and iOS. Run Jest, pnpm check, web export, and strict OpenSpec validation before archival.
