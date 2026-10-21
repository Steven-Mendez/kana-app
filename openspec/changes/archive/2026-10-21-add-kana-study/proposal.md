## Why

Kana currently opens to a placeholder and offers no way to practice recognizing hiragana or katakana. A focused selection → rōmaji answer → feedback → review loop will provide the app's first useful learning experience on mobile and web.

## What Changes

- Replace the placeholder home screen with hiragana and katakana selection, organized into basic, voiced/semi-voiced, and contracted-sound families.
- Allow learners to select whole families, select or clear an alphabet, see the selected-card counts, and combine both alphabets in one study round.
- Provide a distraction-free study screen with one kana prompt, a rōmaji input, explicit answer submission, immediate feedback, and a reveal-answer action.
- Shuffle the selected cards and present each once per round; show progress, correct answers, and a final accuracy summary.
- Let learners review the round's mistakes, repeat its selection, or return to selection.
- Remember the selected families locally. Study content and answer checking work without a signed-in account or a study-related network request.
- Establish a minimalist visual treatment: warm cream backgrounds, dark brown text, a restrained vermilion accent, flat family rows, and one visually dominant action per screen state.

## Capabilities

### New Capabilities

- `kana-study`: Kana catalog, family selection, local preferences, study rounds, answer validation, scoring, mistake review, and accessible cross-platform interaction.

### Modified Capabilities

- `app-structure`: Replace the placeholder-specific centered home-screen scenario with a responsive study-selection home while retaining semantic Tailwind styling and the existing source/navigation conventions.

## Impact

- Future implementation touches `src/app/index.tsx`, adds `src/app/study.tsx`, and registers the route in `src/app/_layout.tsx`.
- Static content belongs in `src/data/`; shared selection UI belongs in `src/components/` when reused; study logic and preference storage belong outside the routes, with colocated tests.
- Reuse the installed Expo Router, Uniwind, and AsyncStorage dependencies. Extend the semantic tokens in `src/global.css` with the specified palette while preserving the existing background and foreground colors. No new runtime dependency is required by this proposal.
- This is a local learning feature: no database schema, remote progress synchronization, authentication flow, or API change is required.
- Scope excludes vocabulary, sentences, kanji, extended loanword katakana, audio, handwriting, font settings, spaced repetition, and historical statistics. Implementation is authorized. App-level navigation, profile layout, theme and language settings are specified separately in `add-account-navigation`.
