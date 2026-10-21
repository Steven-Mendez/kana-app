## Why

The supplied Stitch export describes a calm, connected learning experience, while the app currently opens directly into configuration. Adopt its layout and visual hierarchy around the existing practice engine.

## What Changes

- Add an actionable home dashboard, a browsable syllabary, and a progress screen.
- Move family selection to /practice and introduce four primary destinations: Home, Syllabary, Practice, Progress. Keep Profile and Settings reachable from the app header.
- Reuse the warm palette, circular kana, rounded white surfaces, and clear primary actions from the reference; retain native tabs and focused keyboard practice.
- Derive reviewed, due, learning, and scheduled counts from existing local FSRS cards, with loading, retry, and honest first-use states.

## Capabilities

### New Capabilities

- `study-overview`: Dashboard, syllabary exploration, and truthful local study progress.

### Modified Capabilities

- `app-navigation`: Primary learning destinations and secondary account/settings access.
- `app-structure`: Home dashboard and dedicated practice route.
- `kana-study`: Family selection is on Practice rather than Home.

## Impact

Expo Router routes, shared navigation and overview components, localized copy, read-only progress summaries, and tests. No dependencies, backend changes, storage migrations, or grading changes. Drawing, audio, multiple choice, XP, streaks, and retention predictions are not implemented by this layout adaptation.
