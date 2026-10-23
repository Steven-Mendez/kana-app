## ADDED Requirements

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
