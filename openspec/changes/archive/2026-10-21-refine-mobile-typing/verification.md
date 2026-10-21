# Mobile typing verification

Date: 2026-10-21.

## Adapted experience

- `TypingPrompt`: cardless, keyboard-sized kana with semantic success/error feedback.
- `TypingFeedback`: a reserved two-line feedback area with a symbol and explicit text; long messages can grow.
- `StudyProgress`: answered/correct counts and consecutive correct answers for this round.
- `StudyResults`: accuracy, three compact metrics, best round streak, and original typed mistakes alongside canonical corrections.
- The same native TextInput remains mounted; matching readings still advance automatically and incorrect answers retain the confirm/reveal/continue sequence. No new dependencies or persistent metrics.

## Automated validation

- `pnpm test --runInBand`: 10 suites, 51 tests passed. New tests cover broken/reset streaks, original-answer preservation, summary/review and stable input/feedback identity. Existing tests cover aliases, fast buffered input, stale events, exactly-once review commits, failed saves, retries and free-practice isolation.
- `pnpm check`: passed lint, TypeScript, formatting and React Doctor. The same seven advisory warnings remain in existing Practice/StudySession complexity and provider/lookup patterns.
- `pnpm build:web`: passed; 13 static routes exported.
- Strict OpenSpec validation and archive run after verification.

## Web interaction

Tested in the in-app browser at 1456 × 853. Dark free practice completed with four correct answers and one typed mistake: 80% accuracy, best streak 3. Confirmed mistake, reveal and continuation with Enter; the input retained focus. Review mistakes reopened only the missed kana with zero counters and an empty input, then completed at 100%. Repeat selection restored all five original cards with zero streak.

Measured before and after incorrect feedback: input remained x=632, y=643, width=192, height=58; prompt remained y=279.5, height=160. The focused DOM element stayed the same input. No horizontal overflow. Light scheduled prompt also rendered with focused input and reserved status space; no review was committed during that inspection.

## Native interaction

Tested on the local Kakareta Demo iOS 26.5 simulator in Expo Go. Two consecutive yōon readings advanced without Enter or tapping the input and reached streak 2. A typed `x` on the third prompt broke the streak, retained the draft, and hid the canonical reading until Show reading. With the software keyboard visible, prompt, input, both feedback lines and action all fit without scrolling. Reveal preserved keyboard visibility. Completion showed 67%, two correct, one error and best streak 2, with `x` and `kyo` in the correction row.

Review mistakes reset to one card with an empty focused input and zero streak. Tapping k/y/o on the software keyboard completed it automatically at 100%. Also checked the dark prompt with its dark keyboard and increased the simulator text size from level 3 to 4: prompt/input/actions remained visible. Restored text size to level 3 afterward.

Device Hub's hardware typing injection hides its simulated software keyboard, so keyboard-layout evidence was captured with software keyboard enabled and subsequent reveal/review interactions used touch controls. This does not indicate input unmounting: continuous focus was verified through consecutive answers and component identity tests.

## Evidence and limits

Screenshots live at:

`/Users/wern/.codex/visualizations/2026/10/21/01a1601c-9f61-75f0-9a95-00e71e68d5cd/mobile-typing/`

- `ios-prompt-light.png`, `ios-prompt-dark.png`
- `ios-error-keyboard-light.png`, `ios-reveal-keyboard-light.png`
- `ios-results-light.png`, `ios-larger-text-dark.png`
- `web-error-dark.png`, `web-results-dark.png`, `web-prompt-light.png`

Android runtime, physical devices, extreme accessibility sizes and a 320px web viewport were not exercised. Scheduled failure/retry behavior was verified by automated interaction tests. Existing stored selections were retained; all completed manual rounds were free practice.
