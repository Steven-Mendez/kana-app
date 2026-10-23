## MODIFIED Requirements

### Requirement: Responsive application navigation

The app SHALL expose three primary destinations through Expo Router: Home (`/`), Kana (`/kana`) and Profile (`/profile`). `/syllabary` and `/practice` SHALL redirect to `/kana` and `/progress` SHALL redirect to `/profile`. Every platform SHALL use the same arcade navigation drawn by the app, not platform tab bars or native stack headers: below content on phone widths and above content from 768 logical pixels, with accessible selected state and a non-color indicator. Each destination SHALL have its own soft-ink icon drawn as a single-weight line: a house for Home, a kana tile for Kana and a learner for Profile. Unselected icons SHALL be unfilled lines in the muted foreground color; the selected icon SHALL take the primary color with a soft accent fill and a primary-filled detail, and SHALL show a short primary bar beneath it as the non-color indicator. On phone widths the bar SHALL show icons only, at about 30 points, each with an accessible name; the top bar SHALL show the same icons beside their labels with the same selected treatment. Settings (`/settings`) SHALL remain a secondary stack destination opened from Profile. On phone widths only Home SHALL show an app bar, with the fox logo and the daily streak badge. Other screens SHALL NOT show an app bar: Kana and pushed screens show their name as a large title at the top, pushed screens with the back button beside it, and Profile starts with the learner's identity. Navigation SHALL respect safe areas and theme. Secondary screens SHALL place their first readable content below the back control, including at enlarged text sizes, and allow it to scroll. They SHALL offer an accessible back button that returns to the previous screen, or to Home when the screen was opened directly, and the native back gesture SHALL keep working. Study SHALL hide global navigation and provide an accessible Change selection action returning to `/kana`.

#### Scenario: Navigate on a phone

- **WHEN** the learner changes primary destinations or opens Settings
- **THEN** the active destination is identifiable and returning to Kana retains selected kana
- **AND** content and primary actions remain above navigation and safe areas

#### Scenario: Same navigation on every platform

- **WHEN** the app runs on iOS or Android
- **THEN** it shows the arcade bottom bar instead of the platform tab bar and stack header

#### Scenario: Icon-only bottom bar

- **WHEN** the learner views a primary destination on a phone
- **THEN** the bottom bar shows the three line icons without labels
- **AND** each tab announces its destination name and the selected tab is filled in the primary color with a bar beneath it

#### Scenario: Old links

- **WHEN** a learner opens `/syllabary`, `/practice` or `/progress`
- **THEN** the app shows Kana, Kana or Profile respectively

#### Scenario: Direct route and browser navigation

- **WHEN** a learner opens any primary or secondary URL directly on web
- **THEN** the correct screen renders with working keyboard links and browser back

#### Scenario: Enter and leave study

- **WHEN** study opens from Home or Kana and is closed
- **THEN** tabs are hidden during study and Kana opens with the saved selection intact

#### Scenario: Read and leave Settings

- **WHEN** the learner opens Settings from Profile
- **THEN** the back control does not cover the first text
- **AND** the back button and back gesture return to Profile

### Requirement: Profile represents guest mode honestly

Profile SHALL show the account or guest status, an identifiable sign-in area, a Settings control, and statistics derived only from saved data: the daily streak, kana studied out of the catalog, unique kana reviewed today, saved reviews, per-alphabet coverage and memory stages. Profile SHALL NOT collect credentials outside the sign-in flow, claim successful authentication it did not perform, display invented statistics, or require network access to show local statistics. Loading and retryable errors SHALL be distinct from zero progress.

#### Scenario: Open guest profile

- **WHEN** a guest with no saved reviews opens Profile
- **THEN** the screen shows guest status, a sign-in action near the top and a short explanation with a Start practicing action instead of zero statistics, with no streak claimed
- **AND** Settings opens from the gear and returns to Profile

#### Scenario: Profile after studying

- **WHEN** reviews have been saved today
- **THEN** the streak, studied kana, today's count and memory stages reflect those saved reviews
