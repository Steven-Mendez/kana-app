## Why

A new learner opening Home sees "Pick up where you left off" and "Start review" for the default あいうえお selection even though nothing has been studied, which promises a history that does not exist. Coverage colours are also misleading: Katakana's 0% is painted in the success colour, and Progress fills the unseen stage with a full primary-red bar that reads as an alert.

## What Changes

- Home's next-step card uses first-use wording ("Your journey starts with あ", "Start practicing") until at least one review is saved; returning learners keep "Pick up where you left off" and "Start review". The action and its study parameters are unchanged.
- Both alphabets use the same primary accent for their glyph, percentage and coverage bar; success is no longer used to tell the alphabets apart.
- Progress bars take a semantic tone: unseen kana use a neutral fill, the review stage keeps success, and other stages keep primary.
- Shared code only, identical on iOS, Android and web.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `study-overview`: first-use Home wording and semantic progress colours.

## Impact

Home screen, `progress-overview` components, Progress screen, localized copy and Home/Progress tests. No data or storage changes.
