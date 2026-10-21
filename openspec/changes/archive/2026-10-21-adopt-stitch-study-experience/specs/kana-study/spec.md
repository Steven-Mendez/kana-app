## MODIFIED Requirements

### Requirement: Learners select families across both alphabets

The Practice screen at `/practice` SHALL offer Hiragana and Katakana views, three labeled catalog sections, and independently selectable families showing kana with canonical rōmaji. A family toggle SHALL include or exclude its entire family. Switching the visible alphabet SHALL retain both alphabets' selections. Select all and Clear all SHALL affect only the visible alphabet. The screen SHALL show the selected-card count for each alphabet and the combined total used by Start study.

On first use, the application SHALL show Hiragana with only its five vowels selected and no katakana selected. A zero-card selection SHALL disable Start study and display an instruction to select at least one family.

#### Scenario: First study session

- **WHEN** a learner opens Practice without saved preferences
- **THEN** あ, い, う, え, and お are selected as one family
- **AND** Start study indicates five cards

#### Scenario: Mixed selection

- **WHEN** the learner selects hiragana vowels, switches to Katakana, and selects katakana vowels
- **THEN** the selection contains five hiragana and five katakana cards
- **AND** starting study includes all ten cards regardless of the visible alphabet

#### Scenario: Bulk actions are scoped to the visible alphabet

- **WHEN** the learner uses Select all and then Clear all while viewing Katakana
- **THEN** the katakana count changes to 107 and then zero
- **AND** the hiragana selection is unaffected

#### Scenario: Empty selection

- **WHEN** both alphabets have no selected families
- **THEN** Start study is disabled and the learner is told to select a family
