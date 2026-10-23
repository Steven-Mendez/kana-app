## Why

On iOS and Android the app used the platform tab bar (`NativeTabs`, Liquid Glass) and native stack headers, which clash with the arcade kitsune screens. The other screens also repeat themselves: Syllabary and Practice draw the same kana table twice, Home's board is a third copy of it, due review appears on Home and Progress in two styles, alphabet coverage appears on Home and Progress, the selection appears on Home, Practice and Profile, and Progress, Profile, Settings and account still use the old flat cards and buttons.

Duolingo lessons, applied without copying its look: few tabs, one clear next action on the first tab, a single characters screen where learning and progress live together, and statistics inside the profile with settings behind a gear.

## What Changes

- Every platform uses the same arcade navigation drawn by the app: a bottom bar on phones and a top bar from 768 logical pixels. Native tabs and headers are removed; secondary screens get an accessible back button and keep the native back gesture.
- Three tabs instead of four: **Home** (`/`), **Kana** (`/kana`) and **Profile** (`/profile`). `/syllabary`, `/practice` and `/progress` redirect to their new home so old links keep working.
- **Kana** merges Syllabary, Practice and Home's board: one table of kana tiles coloured by saved FSRS state with a selected check, a row checkbox per family, a detail sheet with the stroke order, readings and actions, alphabet coverage, and a bottom bar with the count, the scheduled/free mode and Start.
- **Home** keeps one main action (today's round), shows due review once there is history and the duel only when a pair exists. The board and legal links leave Home.
- **Profile** gains the statistics from Progress (streak, kana studied, reviews today, saved reviews, per-alphabet coverage and memory stages) and a gear to Settings; the selection summary leaves Profile.
- Profile, Settings, account and reset panels use the game panels, segments and buttons. `Action` becomes a thin wrapper of `GameButton`.
- **BREAKING (specs only):** native tabs and headers, the four-tab layout, Syllabary/Practice/Progress as separate screens, the Home board and Profile's selection counts are replaced as above.

## Capabilities

### Modified Capabilities

- `app-navigation`: arcade navigation on every platform, three tabs, redirects, Profile content.
- `study-overview`: Home composition, the Kana screen replaces Syllabary exploration and Progress, stroke order moves to the Kana detail sheet.
- `kana-study`: selection happens on the Kana screen and its composition changes.

## Impact

Routes under `src/app/` (new `(tabs)/kana.tsx` and `(tabs)/profile.tsx`, redirects for the old paths), `src/components/` (navigation, Screen, new Kana and Profile sections, shared game panel and segment, removal of the catalog, cell, family tile, account links and old progress components), copy strings, and the Home, selection and Syllabary tests. No change to study, FSRS, sync, storage or the selection format. Builds on `add-arcade-study-loop`, which should be archived first.
