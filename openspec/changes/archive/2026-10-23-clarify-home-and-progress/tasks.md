## 1. Implementation

- [x] 1.1 Switch Home's next-step title and action between first-use and returning wording from saved review counts, with localized copy.
- [x] 1.2 Replace ProgressBar's `green` flag with semantic tones; use primary for both alphabets and neutral for unseen kana.

## 2. Verification

- [x] 2.1 Add or update tests for first-use and returning Home wording and progress tones.
- [x] 2.2 Run pnpm test --runInBand, pnpm lint, pnpm exec tsc --noEmit, pnpm check, pnpm build:web and strict OpenSpec validation.
- [x] 2.3 Verify Home and Progress on the iOS simulator for a fresh installation and after one review.
