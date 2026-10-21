## Why

The study flow needs an app-level layout that makes practice, profile, and settings easy to find on phones and the web. The user also wants a calmer, more compact mobile design and working theme/language preferences.

## What Changes

- Add responsive navigation to Practice, Profile, and Settings, with bottom navigation on phones and a top navigation bar on wide screens.
- Add a guest profile with a clearly unavailable sign-in entry; the user's latest clarification explicitly defers authentication implementation.
- Add locally persisted light/dark appearance and Spanish/English language settings, and a selection reset action.
- Translate selection, study, feedback, results, navigation, and accessibility labels.
- Preserve the focused study screen and its selection/round lifecycle.

## Capabilities

### New Capabilities

- `app-navigation`: Responsive navigation and a guest profile/sign-in layout.
- `app-preferences`: Persistent appearance/language choices and localized study UI.

### Modified Capabilities

None. The active `add-kana-study` change is reconciled to allow the separately specified navigation and preferences.

## Impact

Root layout, shared screen shell and tokens, new profile/settings routes, local preference storage, and all study UI copy. Reuses Expo Router, Uniwind, AsyncStorage, and existing controls. No authentication endpoints, database changes, or account data are introduced.
