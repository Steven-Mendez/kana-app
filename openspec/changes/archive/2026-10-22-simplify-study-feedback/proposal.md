## Why

Reviewing the study loop on an iPhone showed two sources of friction. A confirmed mistake hides its reading until the learner presses Show reading, so the correction arrives one step after the moment it is most useful. The header also spreads answered, correct and streak counts over three separate labels, colours a zero correct count green and competes with the kana for attention.

The user approved showing the reading immediately while still requiring an explicit Next to continue, and a compact single-line header.

## What Changes

- Submitting an incorrect draft grades it and shows the canonical reading together with the submitted answer in one step. Enter or Next then continues; incorrect answers still never advance automatically. The Show reading action and its copy are removed.
- The header keeps the close action and Finish practice but replaces the three counters with one muted summary line (`3 answered · 2 correct`). The current streak joins that line only from two consecutive correct answers.
- The incorrect/correct feedback symbol aligns with the first line of feedback text.
- Behaviour is implemented in the shared reducer and React Native components, so it applies identically on iOS, Android and web.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kana-study`: immediate reading after a confirmed mistake, compact study header and aligned feedback symbol.

## Impact

`studyReducer` and its `Round` state, `StudySession`, `StudyProgress`, `TypingFeedback`, localized study copy and their tests. Scheduled-review persistence is unchanged: a mistake is still committed once with an Again rating and Next stays gated on a successful save. No dependencies, storage or Practice changes.
