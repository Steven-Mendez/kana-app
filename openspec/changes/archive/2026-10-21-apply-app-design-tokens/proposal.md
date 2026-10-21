## Why

The app needs its approved color system applied consistently across web and native screens. The current approximate palette differs from the selected cream, terracotta, burgundy, and coral values.

## What Changes

- Centralize exact OKLCH primitives and light/dark semantic mappings in `src/global.css` through the existing Uniwind theme.
- Preserve existing surface, success, and error utility contracts and expose the complete approved semantic palette.
- Apply the distinct focus-ring and input-border tokens to interactive components.
- Verify real web and local iOS rendering, theme persistence, navigation, selection, and study feedback.

## Capabilities

### New Capabilities

- `app-design-system`: the app-owned two-layer color system and cross-platform theme contract.

### Modified Capabilities

None.

## Impact

Shared CSS, color-related utility classes, native tab colors, input selection color, and automatic native appearance configuration. Existing layout, study behavior, storage identities, branding assets, and dependencies remain compatible. Verification includes the current active Practice and continuous-input changes without archiving those unrelated changes.
