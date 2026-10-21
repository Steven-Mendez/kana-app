# Individual kana selection

## Why

Learners need to target specific characters in short mobile typing sessions, while keeping convenient family selection. Remove the unnecessary daily encouragement notice from Home.

## What Changes

- Select each kana independently, with accessible partial family state and family bulk toggles.
- Preserve alphabet/category navigation, counts, mobile touch targets and the compact Start footer.
- Persist character IDs; migrate saved family selections without losing deliberately empty selections.
- Pass exact character snapshots into study and Home resume; retain legacy study links and syllabary family shortcuts.
- Remove the Home daily encouragement/local-progress banner.

## Capabilities

### Modified Capabilities

- `kana-study`: individual selection, persistence, and mobile composition.
- `study-overview`: exact selection resume and no encouragement banner.

## Impact

Selection UI, local selection storage, study route setup, Home/Profile/Syllabary consumers, regression tests. No new dependencies or review-history schema changes.
