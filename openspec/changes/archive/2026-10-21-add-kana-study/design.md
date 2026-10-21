## Context

The application has an Expo Router root layout, a `Hello World` home screen, Tailwind/Uniwind tokens, and an installed AsyncStorage dependency. There is no kana catalog, study state, or shared study UI. This change defines the first learning flow; its implementation is a separate step.

The visual reference is the team's previous [QuickKana app](https://quick-kana.vercel.app/), reviewed in Chrome on desktop and at a 390-pixel mobile viewport, including free selection and practice. Its light palette, restrained typography, aligned kana previews, large study glyph, and underlined answer field inform this design. The requested direction is a more minimal version of that identity; feature behavior remains defined by this change's requirements. The reference-derived palette values in the spec were taken from computed light-theme colors and converted to sRGB; its background and foreground already match `src/global.css`.

## Goals / Non-Goals

**Goals:**

- Make the first useful study session available directly from home with five vowels ready to practice.
- Support both alphabets, targeted family selection, mixed rounds, immediate correction, and focused review.
- Define deterministic answer/scoring rules and observable edge cases before implementation.
- Preserve the project's small cross-platform structure and locally available content.
- Retain the familiar warm visual identity with fewer controls, flat grouping, and a clear focus on the current learning task.

**Non-Goals:**

- Vocabulary, sentences, kanji, historical kana, extended loanword katakana, handwriting, or audio.
- Accounts, remote study storage, historical analytics, streaks, or timed challenges. Spaced-repetition scheduling is a separate capability with a dedicated entry; this change defines free practice.
- Configurable fonts, auto-submit settings, manual review bookmarks, or undo controls. Theme and language preferences are covered by `add-account-navigation`.
- The previous app's guided path, lesson locks, mastery bars, preset chips, and statistics dashboard. App-level navigation is covered by `add-account-navigation` and stays hidden during study.

## Decisions

### 1. Two routes, with results and review inside study

Use `src/app/index.tsx` for selection and `src/app/study.tsx` for the active round, feedback, and summary states. Register study in the existing root stack. Pass a snapshot of selected family IDs as a route parameter, validate it against the catalog, and derive the cards. The parameter contains selection only, never scores or answers. Missing or unusable setup returns to `/`; reload with usable setup starts a new round.

Keep the active round in the study screen's React state. A small pure study module outside `src/app/` owns shuffle, answer checking, and grading transitions, with colocated tests. Reuse that logic for review. No global store or separate results route is needed because no other screen consumes the transient score. The existing home route and root integration lifecycle remain in place.

Disable web async routes in the Expo Router config plugin. SDK 58 otherwise loads study in a separate chunk on first navigation, which would break the promised complete offline loop when connectivity is lost on the already-loaded selection page. Both small routes ship in the initial bundle.

### 2. One explicit static catalog

Place the catalog in `src/data/kana.ts`, using script-qualified identities for cards and families. Keep kana glyphs and accepted readings explicit: pronunciation is not inferred from Unicode or synthesized by appending vowel suffixes. A shared family definition can hold both scripts where that removes duplication without obscuring exceptional readings.

The scope is 46 basic + 25 voiced/semi-voiced + 36 contracted cards per script. The two ja families retain separate identities even when their canonical readings match. Data checks cover counts, unique identities, family membership, and all alias exceptions. No API or transliteration dependency is needed for this fixed catalog.

### 3. Select families, then study their union

The home screen shows one alphabet at a time through a single Hiragana/Katakana segmented control, followed by Basic, Dakuten / Handakuten, and Yōon sections with plain headings. Each family is one accessible selection row showing its constituent kana and canonical readings. Select all and Clear all appear once and are scoped to the visible alphabet; per-alphabet counts beside the alphabet choices and a combined count in the start area make mixed-round behavior explicit.

Family-level selection keeps the first version simpler than individual-card toggles plus partially selected family states. Present each family as a flat row with a selected indicator and aligned kana/rōmaji pairs. Apply the soft accent fill and primary-colored edge to the whole selected row; its glyphs are previews, not separate buttons. Unselected rows use the page background and subtle separators. Create shared UI only where the same rendering is actually reused.

### 4. Explicit submission and finite rounds

The interaction is `answering → feedback → next card or summary`. Check answer or the keyboard submit action grades only while answering; Next is an explicit action while feedback is visible. Reveal answer follows the incorrect path. Lock a card's result after grading so repeated events cannot alter counters or consume another card.

Explicit submission avoids judging partial input or accepting a short alias before the learner finishes typing. Feedback remains available until the learner is ready. A round visits each selected card once in shuffled order rather than running indefinitely; this gives a clear endpoint and an unambiguous denominator for accuracy without introducing a session-length setting.

The summary offers Repeat selection, Review mistakes when applicable, and Change selection. Store the original selection snapshot separately from the current review deck so Repeat selection always restores the complete original set. Each review is a fresh round over that round's mistakes, with its own score. No adaptive scheduling or cross-session mistake queue is implied.

### 5. Save preferences, keep results transient

Reuse installed AsyncStorage through a small preference module in `src/lib/`, using a feature-specific key such as `kana-study-selection`. Persist only selected family IDs and the visible alphabet. Read after mounting so static web export never depends on browser storage. Complete hydration before enabling study or writing preferences; validate reads and ensure rapid selection changes cannot leave an older snapshot as the final saved value.

Valid empty selection stays empty. Filter unknown/duplicate family IDs. Missing preferences use the first-use defaults; malformed data or storage errors use the specified fallback and a non-blocking notice. Keep current state usable if storage fails.

Free-practice answers, scores, and mistake-review decks remain in memory. Going back to selection or fully reloading ends the round; a surviving backgrounded process retains it. Explain this briefly in the study UI. The separately specified spaced-repetition capability persists scheduled reviews locally while round scores remain transient.

### 6. Minimal warm visual language

Use the light palette defined in the `kana-study` visual requirement as the baseline. Keep all repeated colors in `src/global.css`, retaining `background` and `foreground` and adding only the semantic roles used by these screens. The vermilion `primary` is reserved for the main action, selected indicators, and focus. Soft peach `accent` communicates selection. Use `foreground` for all text on peach or muted control backgrounds, including selected rōmaji; reserve `muted-foreground` for supporting text on the cream canvas. This preserves 4.5:1 text contrast without adding another shade. Success and error colors are additions for this feature's feedback, not measurements from the previous app. Status messages always include text or symbols.

Use a system sans-serif for interface text and the platform's readable Japanese glyph fallback. The previous app's Inter font informs the plain, medium-weight hierarchy, but a downloaded font is not necessary for this first implementation. Preserve system text scaling. The following logical-pixel values map to Tailwind's existing scales:

| Element                | Baseline                                                                         |
| ---------------------- | -------------------------------------------------------------------------------- |
| Page title             | 24px, semibold; one short supporting line at 14px                                |
| Section heading        | 18px, semibold                                                                   |
| Body and action labels | 16px; secondary text 14px                                                        |
| Family preview         | 24px kana above 12px rōmaji                                                      |
| Study prompt           | 96px on phones, up to 128px on wide screens, adapting for yōon and enlarged text |
| Answer field           | 20px centered text; at least 48px high, up to 320px wide                         |
| Spacing                | 4/8/12/16/24/32px; 16px phone gutters, 24px wide-screen gutters                  |
| Corners and separators | 8px control/selection corners, 1px neutral separators, 2px focus indication      |

Use whitespace and alignment rather than nested panels. Render the page background continuously; avoid decorative gradients, elevated cards, oversized branding, and a separate border around every kana preview. Controls retain distinct pressed, selected, focus, and disabled states. A filled primary button is the strongest accent; secondary actions are text or quiet neutral controls. Every interactive target remains at least 44px in both dimensions even when its visible label is smaller.

#### Selection composition

Keep a compact `Kana` title, brief instruction, alphabet selector, one bulk-action row, and the three catalog sections in that order. Use one vertical content column, centered with a maximum width of 896px on wide screens. Each family keeps its kana in reading order across the row; previews can wrap when enlarged text requires it. Avoid a second mode selector, separate category tab strip, preset chip row, individual-cell toggles, and per-kana mastery decoration.

On phones, use 16px spacing between major sections, 4px between family rows, and 8px vertical row padding with a 64px minimum row height. This keeps more kana visible while preserving generous whole-row touch targets. All families stay within the viewport width rather than forming an oversized horizontal chart.

Place the combined selection count and Start study in a simple bottom action area aligned with the content, with a solid background and subtle top separator. On phones it stays above the safe-area inset and the scroll area reserves its height; on wider screens it uses the same bounded content width. This is a single action area, not a floating pill or global tab bar. It must never cover the last family or keyboard focus.

#### Study composition

Use a compact top row for Change selection, answered/total progress, and the running correct count. Center the alphabet label, large kana, underlined input, feedback, and current primary action in a single column up to 512px wide. Following the implementation review, give the kana more breathing room, limit the input to 192px, and use compact content-width answer actions instead of a full-width button stack. Keep Reveal answer as a secondary text action beside Check answer, wrapping when enlarged text needs it. Check answer changes to Next or Show results after grading, so there is one filled main action at a time. The input has a neutral label or placeholder such as `Rōmaji`; it never exposes the answer before grading. Show feedback only after submission, avoiding repeated instructions below the input. Keep the transient-session explanation to one short, quiet footer sentence.

With the software keyboard open, reduce flexible whitespace and let the content scroll so the input, feedback, and current action remain reachable. Centering is an idle-layout preference, not a fixed-height constraint. Avoid a card around the prompt, timer, streak, multi-metric dashboard, and navigation to unrelated features.

#### Results composition

Show one results heading, prominent accuracy, a concise correct/incorrect line, and a plain list of missed kana and readings. Review mistakes is the primary action when available; otherwise Repeat selection is primary. The remaining actions are secondary. Reuse the same spacing, palette, and control shapes rather than introducing score cards, charts, or celebratory overlays.

### 7. Verification follows observable learning behavior

Use focused colocated checks for catalog coverage, aliases and normalization, shuffled-deck membership, single-card rounds, duplicate grading, review isolation, selection sanitization, and score calculation. Use existing tooling where possible; a test framework decision belongs to implementation if a meaningful check cannot run with the installed tooling.

Manually exercise selection → mixed study → correct/incorrect/reveal → results → review on web and native. Check narrow layouts, enlarged text, screen-reader feedback, software and hardware keyboards, storage failures, back navigation, and reload. Run the project quality gate and static web export. SDK 58 documentation was checked via the [versioned reference](https://docs.expo.dev/versions/v58.0.0/) and [documentation index](https://docs.expo.dev/llms.txt); implementation must consult the relevant versioned API pages before using them.

Capture selection, study feedback, and results at 320px, 390px, and a desktop viewport. Verify the specified palette, text hierarchy, single primary action, row-level selection treatment, and unobscured bottom content. Compare the visual identity with the reference while evaluating the simplified compositions specified here; pixel parity and the reference's additional controls are not acceptance criteria. Check normal text contrast of at least 4.5:1 and focus/selected indicators of at least 3:1 against adjacent colors.

## Risks / Trade-offs

- [Reading variants can accidentally accept the wrong kana] → Use card-specific aliases and explicit examples for じ/ぢ, ず/づ, and yōon; show one consistent canonical reading in correction.
- [Software keyboards and enlarged text can hide the action] → Verify the actual native interaction, keep content scrollable, and test the 320-logical-pixel layout.
- [A restored or rapidly edited selection can be overwritten by stale storage writes] → Hydrate before saving and serialize writes so the latest selection wins.
- [Local-only preferences do not synchronize across devices] → Present them as device-local settings; keep account synchronization outside this change.
- [Transient rounds are lost on a full reload or process termination] → Explain the lifecycle in the study UI; save the selection so starting again is straightforward.
- [A freshly opened web URL cannot be guaranteed offline] → Promise offline study only for installed native apps and an already-loaded web page; service-worker caching is outside scope.

## Migration Plan

There is no database migration or existing study history to transform. Implementation adds bundled data and a new namespaced preference key, then replaces the placeholder home screen after verification. Reverting the feature restores the previous route implementation; the unused preference key is harmless and unrelated local storage must not be cleared.

Keep this OpenSpec change active while implementation tasks are pending. Archive only after implementation and its checks are complete, merging the kana-study capability and the app-structure styling delta into the consolidated specifications.

## Open Questions

No blocking questions for this first draft. Explicit submission, finite rounds, the 107-card-per-alphabet catalog, and local-only preferences are the proposed baseline for product review.
