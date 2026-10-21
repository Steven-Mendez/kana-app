## Design

Use the supplied Downloads/stitch_kana_practice_app screenshots as composition references, preserving the app name Kana and the existing fox logo from assets/icon.png in web/native headers and Profile, as explicitly requested. Home leads with a greeting and one resume-selection action, followed by alphabet coverage and due-review access. Syllabary is a five-vowel matrix with YA/WA gaps and three-column yōon, individual reading inspection, and an explicit action to configure that family. Progress shows actual FSRS stages and counts; reviewed coverage is never called mastery.

Keep existing custom Uniwind controls and Action/Icon primitives for visual consistency. No new picker, sheet, slider, toggle, or native form dependency is needed. Keep four native learning tabs; Profile and Settings become root stack routes, reachable from header actions on all main screens. Web uses the same destinations and a compact mobile brand header. Study closes to /practice and preserves continuous input behavior.

Load the existing 214 cards through reviews.load on focus, foreground, manual refresh, and a minute tick while focused. Cancel stale reads on blur and show an error instead of fabricated zero counts. Summaries are pure functions over a snapshot and current time. Today counts unique cards whose last review is on the current local calendar day; it does not claim session duration or total answers today. Due cards exclude unseen cards. A dedicated due-only study entry snapshots due card IDs, validates them against the selected families, and still uses ScheduledStudy to recheck eligibility. Normal scheduled practice retains new-card introduction.

Use the existing warm light/dark semantic palette, scrollable centered content, accessible target sizes and labels, and responsive wrapping. Leave the carefully measured study keyboard layout intact.

## Verification

Test progress boundaries, due-only setup, library selection, loading/error recovery, navigation, and existing study behavior. Run all Jest tests, pnpm check, web export, and strict OpenSpec validation. Inspect mobile/wide/light/dark layouts and native navigation when a simulator is available.
