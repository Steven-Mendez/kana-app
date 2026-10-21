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
