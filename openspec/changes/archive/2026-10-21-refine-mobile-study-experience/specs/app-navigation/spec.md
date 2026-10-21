## MODIFIED Requirements

### Requirement: Responsive application navigation

Selection, Profile, and Settings SHALL expose labeled destinations for Practice (`/`), Profile (`/profile`), and Settings (`/settings`) through Expo Router. iOS and Android SHALL use native icon-and-label tabs and native stack headers, with selected state exposed accessibly. Web SHALL retain labeled navigation below content on phone widths and above content from 768 logical pixels, with a non-color active indicator. Navigation SHALL respect safe areas and the chosen theme. Study SHALL retain a focused layout and an accessible Change selection close action without global navigation.

#### Scenario: Navigate on a phone

- **WHEN** the learner visits Profile or Settings from selection
- **THEN** the native tab bar identifies the active screen and can return to Practice
- **AND** selected kana remain unchanged
- **AND** the selection start action and last family are not covered by navigation

#### Scenario: Navigate on desktop or by URL

- **WHEN** the learner opens `/profile` or `/settings` directly on web
- **THEN** the correct screen renders with a top navigation bar on a wide viewport
- **AND** links, keyboard focus, and browser back work

#### Scenario: Enter and leave study

- **WHEN** a learner starts study and then uses its close action
- **THEN** tabs are hidden during study and return with the preserved selection after closing
