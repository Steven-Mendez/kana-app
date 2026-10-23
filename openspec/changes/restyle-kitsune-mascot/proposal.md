## Why

The fox logo is a soft, gradient illustration. Next to the arcade kitsune screens (ink outlines, flat bright fills, solid edges, cartoon flames) it no longer matches the app.

## What Changes

- Redraw the kitsune as a vector in the arcade/comic style: ink outline, flat tangerine fur, cream mask, a kitsunebi flame on the forehead and a solid ink edge under the head.
- Add a shared `Kitsune` component with `happy` and `sad` moods, drawn with `react-native-svg` from theme color roles.
- Use it in the brand bar, the Home round panel, the feedback ribbon (sad on a wrong answer) and the streak celebration.
- Regenerate the app icon, Android adaptive foreground and monochrome icons, favicon and splash image from the same drawing; keep the SVG sources in `assets/source/`.

## Capabilities

### Modified Capabilities

- `study-overview`: branding uses the arcade kitsune instead of the old fox logo.
- `game-components`: the feedback ribbon shows the kitsune's mood for the grade.

## Impact

`src/components/game/kitsune.tsx` (new), `src/components/brand.tsx`, `src/components/home-sections.tsx`, `src/components/study-results.tsx`, `src/components/game/feedback-bottom-sheet.tsx`, `assets/*.png`, `assets/source/`. No route, data or study change.
