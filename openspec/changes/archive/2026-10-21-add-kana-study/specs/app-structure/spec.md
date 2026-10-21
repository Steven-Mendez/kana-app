## MODIFIED Requirements

### Requirement: Tailwind styles work across platforms

The application SHALL support Tailwind CSS 4 classes on React Native components through Uniwind on iOS, Android, and web. `src/global.css` SHALL be the single entry for Tailwind imports and shared design tokens, imported by the root layout. The home and study screens SHALL use utility classes for layout and typography and semantic colors for backgrounds, foregrounds, selection, and feedback.

#### Scenario: Rendering the home screen

- **WHEN** the home screen renders
- **THEN** it presents responsive study selection with consistent gutters, a warm cream background and dark readable foreground text in light mode (or corresponding semantic dark-mode colors), and restrained primary accents
- **AND** its content can scroll as needed on small screens instead of requiring a centered placeholder layout
- **AND** flat family rows and a clear primary action establish the visual hierarchy
- **AND** these styles come from Tailwind utilities and the shared CSS tokens

#### Scenario: Checking types before starting Metro

- **WHEN** a fresh checkout installs the locked dependencies and runs the TypeScript check
- **THEN** `className` props and the global CSS import are accepted without requiring a prior Metro startup
