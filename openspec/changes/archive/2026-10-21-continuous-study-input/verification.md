# Continuous study input verification

## Final approved behavior and root causes (2026-10-21)

- **Manual user confirmation:** after testing on the iPhone simulator, the user explicitly confirmed both automatic advancement without Enter and full visibility above the keyboard. This is user-reported confirmation, separate from the automated runs below. They then requested removal of repository UI automation scripts; those are absent and no automation dependency/config was added. Completed runs below are historical evidence from **retired UI automation**, not commands or scripts to run from this repository.
- The original `input` reducer branch only updated the draft; grading lived behind submit/reveal. That explains the original requirement to press Enter. Input now checks the **new event value** synchronously, grades an exact normalized canonical/alias match, and uses the same exactly-once review path. This was verified against the app actually running in the specified iOS simulator, including taps on software keyboard keys; no claim that the user's report was merely an outdated bundle is needed.
- Partial/wrong drafts do not grade and can be erased/corrected. Enter confirms a wrong draft with its original answer retained, without the canonical reading in visible or announced feedback. The next Enter/Mostrar lectura reveals; another Enter/Siguiente/Ver resultados continues. Explicit Revelar goes straight to the reading. Correct inputs advance automatically within the existing 250 ms feedback window, interrupted by new typing, and only after a scheduled save succeeds.
- Matched text stays during correct feedback so `n` → `nn` is consumed as the current alias. Otherwise only newly appended/replacement characters are buffered. A complete buffered reading is checked on the next event turn after the next prompt renders, with a separate review. Stale timers/callbacks, duplicate events and save retries remain guarded.
- The clipping was reproduced **before editing**: the kana's minimum height, padding, and gaps made unbounded ScrollView content taller than the keyboard-reduced viewport. Retired UI automation still passed visibility assertions for the clipped button. Removing spacing alone was insufficient at smaller heights. The final layout measures the viewport and non-prompt content, then sizes the kana region, font, and line box from the available space. Native automatic font fitting alone briefly produced a blank glyph under a constrained line box during testing; explicit font sizing fixed that and works on Web too. Screen's bottom inset is offset once in iOS keyboard avoidance, removing the duplicated 34-point home-indicator reservation above the keyboard. `Screen` and navigation were not changed.
- `Tu respuesta: undefined` was traced to the **earlier failed retired UI automation**, not hidden by an application fallback: `continuous-study-ios/2026-10-21_130853/continuous-study/commands.json`, lines 205–218, records the full-label lookup and evaluated `inputText: "undefined"`; its failure hierarchy contains the exact reported feedback. Before the fix, entering literal `wrong` produced `Tu respuesta: wrong`. The reducer stores a trimmed string or null for Reveal. Subsequent verification validated the prompt mapping before typing. The original submitted answer remains visible.

## Final automated checks

- `pnpm test --runInBand`: **8 suites / 43 tests passed**. Includes every bundled canonical/alias reading, wrong/partial editing, same-batch input/submit, automatic last-card results, `n`/`nn` extension, paste, early buffered answers, staged wrong Enter and accessible non-disclosure, duplicate/stale callbacks, slow saves, identical retry payloads, and storage isolation. Existing Watchman recrawl advisory remains.
- `pnpm check`: **passed** (ESLint, TypeScript, Prettier, React Doctor). Seven advisory warnings remain: component size/complexity in Practice and StudySession, Practice array lookup, and two context values. No rule suppressions were added.
- `pnpm build:web`: **passed**, 9 static routes.
- `openspec validate --all --strict`: **8 passed / 0 failed**.
- Scoped `git diff --check`: passed.

## Final native verification

Device `D14E6CB0-4CF7-4A31-837F-B72DB503E8A3`, iOS 26.5, app `com.stevenmendez.kanaapp`, current Metro at localhost:8081. The following are completed retired UI automation runs, with independently inspected screenshots and native bounds.

- Continuous-study check: passed with correct-answer Enter commands removed. Three consecutive automatic correct vowels, wrong → reading → continuation, explicit reveal, 60% results, mistake review to 100%, restart and return.
- Software-keyboard check: validated by a temporary flow and final rerun. The simulator initially had a focused cursor but software keys hidden; entering an ungraded `x` through the test driver made its keyboard visible, then **the visible Delete key** removed that draft. Three successive answers were entered by tapping **the visible vowel keys**, with no Enter or input-field taps. Progress became 3/5, correct count 3, keyboard stayed visible. This checks the first card as well as subsequent ones.
- Scheduled software-key run: **pya, pyu, pyo** entered with separate visible `p`, `y`, vowel key taps, no Enter. Completed 100% with the saved-review result screen. This exercises multi-character native change events and persistence-gated progression.
- Keyboard-layout check: passed after final font/layout changes. Blank, confirmed error, Show reading, Next, explicit reveal, automatic final result, and restart. Screenshots were visually inspected; normal-sized input, correction and complete button fit above the software keyboard without scrolling.
- Full study regression passed: selection/navigation, blank check, uppercase NN, single-card results, repeat/reveal/review, mixed alphabets, staged wrong Enter, 50% totals, manual results and return.
- Scheduled feedback: the final bya run passed confirmed error, saved status, and revealed reading, with complete controls above the keyboard. An earlier hya run was not counted as a pass: its screenshot showed `warn` although the command requested `wrong`, and it reached results unexpectedly. The repeat explicitly asserted the native field's `wrong` value and passed. The cause of that divergent run was not established.
- iOS XXXL (largest non-accessibility text): the kana shrinks and remains visible; full error, input, and action fit without scrolling. Largest accessibility size: scrolling is necessary; both Show reading and Next were scrolled fully into view and operated with the keyboard still open. System text was restored to `large` afterward.

### Measured native bounds (logical points)

Keyboard top is **y=566** on the 402×874 device. Bounds below are full elements, not text-only children:

| State                                       | Input Y                        | Feedback Y | Full current action Y                    |
| ------------------------------------------- | ------------------------------ | ---------- | ---------------------------------------- |
| Confirmed error, normal                     | 354–411                        | 421–469    | Mostrar lectura 477–525                  |
| Revealed error, normal                      | 354–411                        | 421–469    | Siguiente 477–525                        |
| Saved scheduled correction, normal          | 310–366                        | 376–425    | Siguiente 461–509 (saved status 433–453) |
| Confirmed error, XXXL                       | 313–380                        | 390–455    | Mostrar lectura 463–520                  |
| Largest accessibility size, after scrolling | input requires separate scroll | 147–404    | Siguiente 413–523                        |

### Current evidence paths

All paths below are relative to `/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/`:

- Before: `keyboard-before/2026-10-21_132321/keyboard-before/takeScreenshot/keyboard-before-wrong.png` (clipped button with real `wrong` answer).
- Final normal screenshots: `realkana-final-ios/2026-10-21_134145/keyboard-study/takeScreenshot/`, especially `keyboard-wrong.png`, `keyboard-wrong-reading.png`, `keyboard-revealed.png`, `keyboard-results.png`, and `keyboard-restart.png`.
- Direct software-key proof: `software-keys-ios/2026-10-21_133607/software-keys/takeScreenshot/` and the final `realkana-software-final-ios/` run.
- Scheduled multi-character software typing: `scheduled-software-ios/` (successful flow and `scheduled-software-complete.png`).
- Saved correction: `realkana-saved-ios/2026-10-21_134842/scheduled-feedback/takeScreenshot/scheduled-reading.png`.
- Enlarged text: `realkana-final-xxxl.png`; extreme scroll: `realkana-extreme-ios/2026-10-21_134320/extreme-text/takeScreenshot/extreme-next.png`.
- Native hierarchy evidence: `realkana-wrong-bounds.json`, `realkana-reading-bounds.json`, `realkana-final-saved-bounds.json`, `realkana-final-xxxl-bounds.json`, `realkana-extreme-bounds.json`.
- Regression: `realkana-regression-ios/`. Restored ready-to-try round: `realkana-ready-ios/`.

## Current Web verification and limits

- Chrome page 29 at 320×380 (reduced-height viewport): a readable ぬ, input 148–206, full wrong feedback 214–262, saved status, and Mostrar lectura 298–346 were visible together. Screenshot `realkana-web-short-error.png`. The long scheduled footer can scroll below this exceptionally short viewport; required controls remain visible.
- Injected one Storage.setItem failure for scheduled `na`: the card stayed, retry was shown, input retained focus, and Next was disabled. Typed the following `ni`, then Enter retried the **identical serialized payload**. The retry saved, buffered `ni` automatically graded the following card with its own third write, and focus stayed on the same input. Screenshot `realkana-web-save-error.png`. The storage override was restored.
- Physical devices, Android, screen-reader operation, and a second smaller native simulator were not exercised. Reduced height was tested in Chrome and through the real iOS software-keyboard viewport. Native storage delays/failures were not injected; tests and browser fault injection cover them. Normal native saved-review behavior was exercised.
- An accepted prefix such as `n` necessarily has an ambiguous extension: `nn` entered while that prompt is still visible belongs to that prompt. After advancement, new characters belong to the new prompt. Extreme text or exceptionally long feedback can require scrolling; normal and XXXL phone controls were visually verified without it.
- Final simulator state: the ready-state check completed all assertions and captured **free-practice Hiragana vowels**, normal system text, empty first-card input and visible software keyboard. During driver cleanup the simulator entered `Shutting Down`; the subsequent device listing confirmed both simulators were `Shutdown`. The screenshot records the successful check, not a currently running simulator. Archival remains with the principal session. No dependencies, commits, pushes, or unrelated files were changed by this work.

## Historical explicit-submit verification (superseded by the update above)

### UX and implementation

- One mounted, editable TextInput throughout a round; autofocus on entry and when repeating/reviewing after results. No keyboard dismissal on grading. Native submitBehavior="submit" and React Native Web 0.21's required blurOnSubmit=false keep Enter from blurring.
- Correct feedback lasts up to 250 ms from grading. New typing interrupts that pause and carries only the new text into the next card. Slow persistence adds no extra feedback delay. Submitting remains explicit.
- Incorrect/revealed answers keep the canonical reading and original answer until Enter or Next/results; interim edits never change the grade and clear on continuation.
- Scheduled progression waits for successful persistence. Retry and Enter retry the same request object/id/time; early text survives delayed or failed writes. Synchronous round/card guards prevent stale callbacks and duplicate grading; timer cleanup and request identity checks cover unmounts.
- Both callers (`src/app/study.tsx` and `src/components/scheduled-study.tsx`) already share StudySession and require no interface changes. StudyResults and the storage service retain their contracts.

### Automated checks

- Jest covers continuous mounted input; interruptible/automatic progression; canonical answers, aliases and whitespace; no grading on typing; wrong/reveal Enter; duplicated and stale callbacks including restarted rounds; same-batch typing/submit; delayed saves; failed-save keyboard/button retry with the identical request; buffered input; final results/restart; timer cleanup and late save completion; free-practice storage isolation.
- `pnpm build:web`: passed, 9 static routes exported.
- `pnpm test --runInBand`: passed, 8 suites / 38 tests. Watchman reported its existing recrawl advisory; tests completed successfully.
- `pnpm check`: passed (exit 0): ESLint, TypeScript, formatting, and React Doctor. React Doctor retains seven advisory warnings: complexity/size in Practice and StudySession, one Practice array lookup, and two context provider values. The StudySession warnings concern the shared screen's size/control flow; no correctness failure was identified, and no suppression or unrelated extraction was added.
- `pnpm exec tsc --noEmit`: passed separately.
- `openspec validate --all --strict`: passed, 8 items / 0 failures, including both active changes.
- `git diff --check` on the changed tracked implementation/tests/flow: passed.

### Chrome at localhost:8081

Tested at 390 × 844 using Chrome DevTools tools:

- Three consecutive correct vowel answers using only type_text + Enter, without fill/click/refocus: same DOM input, focused after each transition, zero recorded blur events.
- Wrong fourth answer stayed visible with focus; Enter advanced. Reveal on the last card followed by Enter produced 60% (3 correct, 2 incorrect).
- Review mistakes accepted both answers and automatically showed 100%. Repeat restored the original five-card deck, empty focused input, and 0/5 progress.
- Injected one failure in browser Storage.setItem for `kana-srs:v1:` writes, then submitted `ka` in scheduled study. The prompt stayed on か, Retry was visible, and Next disabled. Typed `ki` and pressed Enter: the retry payload was identical (including review id/time), the prompt advanced to き, the input still contained `ki`, and remained focused. Another Enter graded き normally.
- Repeated the fault injection with an incorrect answer for な, clicked Retry, and verified the identical payload and restored input focus. Enter then acknowledged the correction and advanced to に without tapping the field.
- A DOM keyboard/input event exercise typed `nn` about 10 ms after submitting `n` in a mixed two-card n round. Within 26.3 ms the next prompt appeared with `nn` intact and only 1/2 graded; 300 ms later the text was still intact. Explicit Enter completed 100%.

Screenshots (approved temporary directory):

- `/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/continuous-web-three-correct.png`
- `/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/continuous-web-wrong.png`
- `/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/continuous-web-restart.png`
- `/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/continuous-web-save-error.png`

### Local iOS simulator

Device: `D14E6CB0-4CF7-4A31-837F-B72DB503E8A3`, iOS 26.5. App: `com.stevenmendez.kanaapp`. These historical checks used retired UI automation.

- Continuous-study check: passed. Three consecutive correct vowels, wrong answer + Enter, reveal + Enter, 60% results, two-card mistake review to 100%, repeat to the original five cards, another correct answer, and return to selection. No input taps anywhere in this flow. Screenshots visually confirm the software keyboard remains present after three correct answers, incorrect/revealed feedback, and restart.
- Study regression: passed in full after updating obsolete manual Next/results expectations. Includes blank checking, `NN` alias, one-card completion, reveal/Enter, mixed-alphabet incorrect/correct answers, result totals, mistake review, manual results button, repeat, and return.
- Combined app regression: executed through settings/profile, all practice checks, and the first half of study checks successfully, then the shell's 240-second timeout interrupted it. The complete study regression rerun passed separately; the combined app run is not claimed as a complete pass.
- The first continuous check failed because retired UI automation copied the prompt's accessible label (`Hiragana: あ`) rather than only the kana. The subsequent complete run mapped its final character and passed.

Successful continuous screenshots:

`/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/continuous-study-ios/2026-10-21_131020/continuous-study/takeScreenshot/`

- `continuous-three-correct.png`
- `continuous-wrong-keyboard.png`
- `continuous-reveal-keyboard.png`
- `continuous-results.png`
- `continuous-restart-keyboard.png`

Regression artifacts: `/private/var/folders/93/x3rr0vks4zg5s_mcxv7crfsh0000gn/T/opencode/continuous-study-regression/`.

### Limits at that earlier stage

Android hardware/emulator, physical iPhone, and VoiceOver/TalkBack were not exercised. Storage failures/delays were exercised in component tests and browser fault injection, not by corrupting simulator storage. On shorter viewports the existing scrollable layout permits reaching buttons below the fold while Enter stays immediately available. The RN 0.88 documentation URL returned 404; Expo SDK 58, current RN TextInput docs, and installed RN/Web behavior/types were checked. No dependencies, commits, pushes, or archival were performed; the principal session owns archival.
