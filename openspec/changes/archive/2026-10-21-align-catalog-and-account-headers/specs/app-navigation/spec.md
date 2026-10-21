## MODIFIED Requirements

### Requirement: Responsive application navigation

The app SHALL expose Home (`/`), Syllabary (`/syllabary`), Practice (`/practice`), and Progress (`/progress`) through Expo Router. iOS and Android SHALL use four native icon-and-label tabs and native stack headers. Profile (`/profile`) and Settings (`/settings`) SHALL remain reachable as secondary stack destinations from the app header. Web SHALL show primary navigation below content on phone widths and above content from 768 logical pixels, with accessible selected state and a non-color indicator. Navigation SHALL respect safe areas and theme. Profile and Settings SHALL place their first readable content below the native stack header, including at enlarged text sizes, and allow it to scroll clear of that header. On iOS their back controls SHALL use the compact icon-only native display while preserving back navigation and the back gesture. Study SHALL hide global navigation and provide an accessible Change selection action returning to `/practice`.

#### Scenario: Navigate on a phone

- **WHEN** the learner changes primary destinations or opens Profile or Settings
- **THEN** the active destination is identifiable and returning to Practice retains selected families
- **AND** content and primary actions remain above navigation and safe areas

#### Scenario: Direct route and browser navigation

- **WHEN** a learner opens any primary or secondary URL directly on web
- **THEN** the correct screen renders with working keyboard links and browser back

#### Scenario: Enter and leave study

- **WHEN** study opens from Home, Progress, or Practice and is closed
- **THEN** tabs are hidden during study and Practice opens with the saved selection intact

#### Scenario: Read and leave an account screen

- **WHEN** the learner opens Profile or Settings on iOS
- **THEN** the native back control does not cover the first text or logo
- **AND** scrolling and returning to the previous screen work with the selection intact
