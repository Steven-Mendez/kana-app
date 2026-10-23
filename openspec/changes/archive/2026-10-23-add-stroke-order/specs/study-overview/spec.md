## ADDED Requirements

### Requirement: Syllabary shows stroke order

The Syllabary detail panel SHALL show the selected kana as a stroke-order diagram on iOS, Android and web. Strokes SHALL appear one at a time in their writing order, the newest stroke SHALL use the primary accent until all are drawn, pending strokes SHALL remain visible as a faint outline, and each drawn stroke SHALL carry its order number at its starting point. Yōon SHALL show both glyphs side by side with numbering continuing across them. Selecting another kana SHALL restart the animation, and an accessible Replay strokes action of at least 44 logical pixels SHALL restart it on demand. When the system requests reduced motion, the finished numbered diagram SHALL appear immediately. The diagram SHALL expose the kana and its stroke count to assistive technology.

Stroke data SHALL ship with the app for every catalogue glyph, work offline, and keep upstream attribution and licence notices. If a glyph has no data, the panel SHALL fall back to the static glyph.

#### Scenario: Inspect a basic kana

- **WHEN** the learner taps あ in the Syllabary
- **THEN** its three strokes are drawn in order with numbers 1 to 3
- **AND** Replay strokes draws them again from the first stroke

#### Scenario: Inspect a yōon

- **WHEN** the learner taps きゃ
- **THEN** き and ゃ are shown side by side and stroke numbers continue from き into ゃ

#### Scenario: Reduced motion

- **WHEN** reduced motion is enabled
- **THEN** the complete numbered diagram appears without stepping through strokes
