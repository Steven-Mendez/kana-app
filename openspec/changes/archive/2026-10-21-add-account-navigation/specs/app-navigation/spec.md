## ADDED Requirements

### Requirement: Responsive application navigation

Selection, Profile, and Settings SHALL expose labeled links to Practice (`/`), Profile (`/profile`), and Settings (`/settings`) through Expo Router. The current destination SHALL have a non-color active indicator. Navigation SHALL sit below content on phone widths and above content from 768 logical pixels, respect safe areas, and remain usable on web, iOS, and Android. Study SHALL retain its focused layout and Change selection action without global navigation.

#### Scenario: Navigate on a phone

- **WHEN** the learner visits Profile or Settings from selection
- **THEN** bottom navigation identifies the active screen and can return to Practice
- **AND** selected kana remain unchanged
- **AND** the selection start action and last family are not covered by navigation

#### Scenario: Navigate on desktop or by URL

- **WHEN** the learner opens `/profile` or `/settings` directly on web
- **THEN** the correct screen renders with a top navigation bar on a wide viewport
- **AND** links, keyboard focus, and browser back work

### Requirement: Profile represents guest mode honestly

Profile SHALL show guest status, current local selection counts, and an identifiable sign-in area. Sign-in SHALL be disabled and labeled as coming soon. Profile SHALL NOT collect credentials, create accounts, claim successful authentication, display invented statistics, or require network access. A working practice action SHALL be available.

#### Scenario: Open guest profile

- **WHEN** the learner opens Profile
- **THEN** the screen shows the local selection and explains that practice works without an account
- **AND** the sign-in entry is visibly unavailable
- **AND** returning to practice preserves the selection
