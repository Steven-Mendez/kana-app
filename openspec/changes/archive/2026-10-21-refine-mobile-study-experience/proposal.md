## Why

The current screens feel like a responsive website rather than an iPhone app: text-only navigation, an oversized selection footer, a long undifferentiated catalog, and study controls competing with the prompt. The supplied references favor a quiet, dominant kana and native navigation, while selection needs clearer organization than those references provide.

## What Changes

- Use native icon-and-label tabs on iOS/Android with native headers; retain responsive web navigation and existing URLs.
- Filter the selection catalog by its three existing categories, preserve family choices across filters, and use a compact mode selector plus one start action.
- Refine grouped family rows, selected indicators, spacing, surfaces, and shared buttons in both themes.
- Recompose study around a compact progress header, dominant kana, and bottom answer area that stays reachable with the keyboard.
- Polish results and supporting screens using the same visual language.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kana-study`: Category-filtered selection, explicit study-mode choice, and keyboard-aware focused study composition.
- `app-navigation`: Platform-native tab navigation and headers alongside the existing responsive web navigation.
- `app-structure`: Group the main routes under a tab navigator while preserving public paths.

## Impact

Touches routes/layouts, shared screen/navigation/action/family/study components, localized copy, theme tokens, and native interaction verification. Adds Expo Symbols for platform-native icons. Existing catalog, grading, FSRS, and persisted data formats remain compatible.
