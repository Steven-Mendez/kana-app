## Context

StudySession is shared by free practice and ScheduledStudy. The reducer already rejects actions for old card identities; scheduled writes retain a request for retry. Current input remounting, disabling, keyboard dismissal, and mandatory Next interrupt the loop. The active Practice redesign remains separate.

## Goals / Non-Goals

**Goals:** continuous keyboard focus, automatic correct matching while typing, staged mistake acknowledgement, adaptive keyboard viewport, and persistence-safe exactly-once progression.

**Non-Goals:** new dependencies, schedule/storage changes, or redesigning Practice.

## Decisions

- Reuse the existing TextInput with no card key or editable toggle, autoFocus on mount/restart, submitBehavior="submit", and refocus after button actions. React Native Web 0.21 also requires blurOnSubmit=false: its installed implementation does not handle submitBehavior. Results can unmount the input; restarted rounds autofocus again. Do not dismiss the keyboard on grading.
- The reducer auto-grades only an exact normalized canonical/alias match on input. Partial or wrong drafts do not grade. A correct card advances within the existing 250 ms feedback window, only once saved; new typing interrupts the pause. Keep the matched draft during that window so appended accepted alias extensions (notably n → nn) remain on the current card, not the next one. Otherwise strip the matched draft from appended text and buffer only the new characters; replacement text becomes the next draft. Track whether text belongs to the next card explicitly. After transition, check a complete buffered reading against the new visible prompt and commit it separately, so fast typing requires no extra Enter. No algorithm can distinguish a second n intended as the current alias from the next card's n while the same prompt is visible: within that brief window, an accepted extension belongs to the visible prompt.
- Enter on a nonblank wrong draft commits Again once and retains the draft, but exposes no canonical reading in visible text or accessibility announcements. A separate readingVisible flag distinguishes confirmed error from revealed correction. The next Enter or Show reading reveals, and only the following Enter or Next/results advances (after saving). Explicit Reveal on an ungraded card grades Again with no answer and shows the reading immediately. Editing after a confirmed error never changes its grade. Next clears wrong/revealed drafts.
- Keep submission and continuation separate callbacks selected by the rendered grade. Use synchronously updated reducer state for event guards, including round deck identity, index, and grade, so old callbacks and duplicate events cannot mutate a new card or a restarted round. Reject keyboard submissions whose native text differs from the current draft.
- Scheduled cards cannot advance until the existing promise succeeds. Keep the exact review request across retries, block concurrent saves, and let Enter retry an error. Early text remains buffered through a pending or failed correct save. Timer cleanup handles grading changes, completion, and unmount.
- Keep accessible textual feedback and Next/results controls for manual acknowledgement and an optional immediate advance on correct cards. Reuse localized strings and existing components.
- Measure the actual ScrollView viewport and the intrinsic header, answer, and footer heights. Size the kana region from the remainder (minus the body's 8-point gap and 8-point bottom padding), with an 80-point legibility floor scaled with system text. Measure the alphabet label and explicitly size the kana font and its 1.25 line box to the remaining height; incorporate system fontScale once, capped at the existing 1.5 multiplier. Native font fitting alone can render a blank glyph under a too-short line-height constraint and Web does not implement that prop. ScrollViews measure content without a height bound, so flex shrinking alone is also insufficient. Keep one keyboard avoidance owner (outer iOS KeyboardAvoidingView, Android window resize). Offset iOS avoidance by Screen's existing bottom inset so the home-indicator area is not reserved twice when the keyboard covers it. Overflow remains scrollable for extreme text or exceptionally short viewports.
- Verify full native bounds and screenshots, not only element-presence assertions: those passed for the clipped Next button in retired UI automation. Preserve the same input instance through viewport changes and feedback.
- The pre-fix native run with literal `wrong` correctly renders `Tu respuesta: wrong`. The earlier failed retired UI automation run at `2026-10-21_130853` records literal `inputText: "undefined"` from indexing the full accessible prompt label; its hierarchy exactly matches the reported feedback. Keep the submitted answer intact and validate any generated test input rather than masking feedback.

## Risks / Trade-offs

- A brief pause can eat fast typing → keep input editable, consume accepted alias extensions, and buffer/carry only new text; check it against the next prompt rather than reusing the previous answer.
- Duplicate keyboard/button events and timer races → synchronous state guards and card/round-scoped actions; test old callbacks and back-to-back calls.
- Saving may be slow or fail → keep the current prompt and clear saving/error status, preserve the request and buffered text, and provide Retry plus keyboard retry.
- Native focus cannot be proved by component mocks → verify continuous software-keyboard input in the local iOS simulator and DOM focus in Chrome.
- RN 0.88 versioned docs URL currently returns 404 → use the Expo SDK 58 docs, current RN TextInput documentation, and installed types as the API cross-check.
