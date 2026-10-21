## Context

Expo SDK 58 already has working local study, FSRS, language/theme preferences, and cross-platform tests. Screens currently share Uniwind tokens and custom text navigation. The user prefers the reference study screens' strong central prompt and low visual noise, but explicitly asks for a better selection experience.

## Goals / Non-Goals

**Goals:** An iPhone-quality learning loop with real native navigation, a scannable selection table, deliberate type hierarchy, clear study modes, thumb-reachable answers, and accessible light/dark styling. Preserve existing data and public URLs.

**Non-Goals:** Adding quizzes, audio, streaks, statistics, authentication, or new scheduling rules from the reference apps.

## Decisions

- Move the three main routes into `(tabs)` with NativeTabs on native platforms and a Slot using the existing responsive web navigation. Keep study outside the tab group. Configure native headers in the root Stack and use the existing preference theme for native chrome. This provides actual system tabs rather than drawing an imitation.
- Keep Uniwind and the warm semantic palette as the source of truth. Add a subtle surface token, larger continuous corners, native SF/Material icons through Expo Symbols, and consistent button sizing. Reuse the house controls; the universal Expo UI picker does not provide the segmented appearance this catalog needs.
- Keep alphabet choice above the list; show one existing catalog category at a time. Category is transient presentation state. Family selections remain the same stored identities, bulk actions remain alphabet-wide, and selected counts remain visible. A radio choice for scheduled/free mode feeds one Start button; both modes keep their existing route parameters.
- Retain a scrollable study surface within KeyboardAvoidingView, with keyboard avoidance outside the safe-area container so its frame and keyboard coordinates share an origin. Use a small close/progress header, flexible central kana, and a bottom input/feedback/action area. Keep explicit Check/Next grading behavior and failure-safe saving. Native icon buttons have full accessible labels and 44-point minimum targets.
- Exercise the new controls on native; add focused selection interaction coverage and keep scheduler/storage tests intact. The UI automation used during this change was subsequently retired.

## Risks / Trade-offs

- Native tab safe areas can double-pad or cover a fixed footer → disable automatic tab content insets and explicitly enable bottom/side edges in the native safe-area container; enable its top edge on study, where there is no native header.
- Category filtering can hide selected families → show combined/alphabet counts and keep bulk actions clearly alphabet-scoped; test mixed/category selection.
- A bottom answer area may consume space at large text sizes → keep the whole study body scrollable, let the selection footer scroll within half the available height when necessary, and test narrow web plus native keyboard layouts.
- Native Symbols requires an updated native binary → use Expo Go where compatible and rebuild the existing simulator app for final verification.

## Migration Plan

No stored-data migration. Route groups preserve `/`, `/profile`, `/settings`, and `/study`. Rollback consists of reverting the UI/navigation change, with saved selection and reviews untouched.
