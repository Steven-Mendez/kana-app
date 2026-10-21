## Why

Learners need the approved Real Kana-style loop: correct readings advance as they type, wrong drafts remain editable, and confirmed mistakes reveal their reading only on acknowledgement. Persistent keyboard focus also requires the whole answer area to fit above the keyboard.

## What Changes

- Keep the answer input focused across cards and focus it on entry and restarted rounds.
- Detect whole canonical/alias matches while typing and automatically advance after brief, interruptible feedback; preserve early typing for the next card and consume accepted alias extensions on the current card.
- Keep arbitrary partial/wrong drafts editable. Enter confirms an incorrect answer without revealing its reading; a second Enter or Show reading reveals it, and a third Enter or Next continues. Explicit Reveal can go directly to the reading. Preserve aliases and exactly-once grading.
- Gate scheduled advancement on successful persistence and preserve the original review on retry.
- Fit the prompt to the keyboard-reduced viewport so the complete input, feedback, and current action stay visible without scrolling at normal text sizes; retain scrolling for extreme accessibility sizes.
- Investigate the reported `undefined` answer against native input and automation records before changing grading.
- Update interaction tests and verify native interactions with temporary tooling. Do not retain UI automation scripts in the repository, as requested after the user confirmed the iPhone behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kana-study`: continuous keyboard input, automatic correct advancement, manual mistake acknowledgement, and completion.
- `spaced-repetition`: persistence-gated automatic progression and keyboard retry.

## Impact

StudySession, the shared study reducer, their tests, localized Show reading copy, and temporary native verification. Both free and scheduled callers use the same loop. No dependencies, storage schema changes, or Practice redesign changes. Repository UI automation scripts were removed at the user's request; their completed runs remain historical verification evidence.
