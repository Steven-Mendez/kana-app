# Align catalog controls and clear account headers

## Why

Switching between Syllabary and Practice shifts both control groups because their introductions, padding and alphabet-button heights differ. On iOS, Settings and Profile content can draw behind the native back button/header.

## What Changes

- Share catalog container, alphabet/category controls and vowel headers with identical vertical geometry.
- Keep Practice selection counts inline so they do not change control height; remove Syllabary's redundant leading introduction.
- Keep kana cells circular with equal dimensions, cap their desktop size and distribute desktop families into two reading blocks.
- Place visible row-selection checkboxes alongside Practice cells.
- Respect the native stack header through automatic scroll insets on Settings/Profile and use a compact icon-only iOS back control.

## Capabilities

### Modified Capabilities

- `kana-study`: aligned catalog controls across browsing and practice.
- `app-navigation`: readable secondary screens with non-overlapping native headers.

## Impact

Shared catalog UI, Practice/Syllabary layout, secondary screen scroll configuration and root stack options. No dependency, storage or study behavior changes.
