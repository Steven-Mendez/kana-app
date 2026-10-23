# app-design-system Specification

## Purpose

TBD - created by archiving change apply-app-design-tokens. Update Purpose after archive.

## Requirements

### Requirement: App color tokens have a single source

The app SHALL define raw color primitives and semantic color mappings in `src/global.css`, using Tailwind CSS 4 through Uniwind. Components SHALL consume semantic classes or resolved semantic variables rather than duplicating literal color values. The palette SHALL belong to the app without references to previous product branding.

#### Scenario: Resolve the approved light palette

- **WHEN** the learner selects light appearance
- **THEN** background resolves to `oklch(98.8% .006 84.6)`, card surface to `oklch(100% .003 84.6)`, foreground to `oklch(25% .04 14)`, and primary to `oklch(57.5% .19 30)`
- **AND** navigation, selected controls, buttons, and content use those shared roles

#### Scenario: Resolve the approved dark palette

- **WHEN** the learner selects dark appearance
- **THEN** background resolves to `oklch(17.8% .017 12)`, card surface to `oklch(22.8% .021 12)`, foreground to `oklch(95.5% .013 84.6)`, and primary to `oklch(67.2% .18 31)`
- **AND** border and input use white at 12% and 16% opacity respectively

### Requirement: Interaction colors follow their semantic roles

Focus indicators SHALL use the ring token. Correct feedback SHALL use emerald-600 in light appearance and emerald-400 in dark appearance; incorrect feedback SHALL use the destructive token. Existing text and selected-state indicators SHALL remain available in addition to color. Native navigation and icons SHALL resolve the same theme through Uniwind.

#### Scenario: Switch appearance across platforms

- **WHEN** appearance changes on web or iOS and the learner navigates through selection and study
- **THEN** backgrounds, text, navigation accents, input borders, and feedback update together
- **AND** reloading restores the selected appearance without changing the study selection

#### Scenario: Check a study answer

- **WHEN** a free-study answer is correct or confirmed incorrect
- **THEN** feedback uses the corresponding semantic color and readable text
- **AND** existing automatic advancement, reveal behavior, and keyboard layout continue to work

### Requirement: Arcade color roles extend the single theme

The theme in `src/global.css` SHALL add arcade color roles as `--palette-*` primitives mapped to `--color-*` roles in both the light and dark variants: `primary-lip`, `tangerine`, `tangerine-lip`, `tangerine-text`, `gold`, `gold-lip`, `on-bright`, `kitsunebi`, `kitsunebi-lip`, `kitsunebi-soft`, `kitsunebi-text`, `ai`, `ai-soft`, `sumi`, `sumi-lip`, `on-sumi`, `locked`, `locked-lip` and `on-locked`. Existing roles and their approved values SHALL NOT change. Text on `tangerine`, `gold` and `kitsunebi` fills SHALL use `on-bright`; text roles SHALL keep at least 4.5:1 contrast on the surfaces they are documented for in both appearances.

#### Scenario: Resolve arcade roles in light appearance

- **WHEN** the learner uses light appearance
- **THEN** `tangerine` resolves to `#fb9437`, `gold` to `#f7c747`, `kitsunebi` to `#22b8e8`, `ai` to `#3a4fbf` and `sumi` to `#2f2a3d`
- **AND** background, card, foreground and primary keep their approved values

#### Scenario: Resolve arcade roles in dark appearance

- **WHEN** the learner uses dark appearance
- **THEN** `tangerine` resolves to `#fc9e47`, `gold` to `#f5cc58`, `kitsunebi` to `#5fdcff`, `ai` to `#8f9cff` and `sumi` to `#3b3550`
- **AND** `on-bright` resolves to the dark ink so labels on bright fills stay readable

### Requirement: Game shapes and type have theme tokens

The theme SHALL define `rounded-tile` (14px) and `rounded-card` (22px) radii and the `font-display`, `font-ui`, `font-ui-bold` and `font-kana` families. The app SHALL load Dela Gothic One, Zen Kaku Gothic New (500, 700) and Zen Maru Gothic (700) at runtime under the same family names on every platform and SHALL keep rendering with system fonts if loading fails.

#### Scenario: Fonts load before the app renders

- **WHEN** the app starts on web, iOS or Android
- **THEN** the root layout waits for the game fonts before rendering
- **AND** a font loading error still lets the app render

#### Scenario: Use game tokens through classes

- **WHEN** a component uses `rounded-card`, `font-display` or `bg-gold`
- **THEN** the class resolves to the theme value without literal colors, radii or font names in the component
