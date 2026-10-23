## MODIFIED Requirements

### Requirement: Game pieces press into a solid edge

Interactive game pieces and panels SHALL render an outlined face over a hard comic shadow: a solid shape of their variant color offset down and to the right by the piece depth, drawn as a view rather than a platform shadow so it matches on iOS, Android and web. On press-in the face SHALL move down and right by the depth and cover the shadow; on release it SHALL return. A raised piece SHALL move up and left together with its shadow. Disabled pieces SHALL render without a shadow, SHALL NOT respond and SHALL expose the disabled state to assistive technology.

#### Scenario: Press a game button

- **WHEN** the learner presses a primary `GameButton`
- **THEN** the face moves 5px down and right within about 90ms and a light impact haptic fires on supported devices
- **AND** releasing triggers the button action

#### Scenario: Disabled button

- **WHEN** a `GameButton` is disabled
- **THEN** it uses the locked colors without a shadow, ignores presses and reports `disabled`

## ADDED Requirements

### Requirement: Comic panel language

The game kit SHALL provide comic pieces built from theme tokens: a caption box (soft, ink, primary or gold fill, uppercase display type, tilted about two degrees); a speech bubble with an outline and a tail; and a screen title in bold UI type, in sentence case and without a shadow, so the app bar stays quieter than the content. Decorative layers SHALL be hidden from assistive technology and SHALL NOT intercept touches, and every piece SHALL stay legible in light and dark themes.

Ink SHALL come in two strengths. Informative content SHALL use a soft line color for outlines and a soft shade for shadows, so text stays the darkest element. Buttons SHALL outline in the darker edge of their own fill rather than ink. Selected segments SHALL show a primary outline over a light accent fill instead of an ink fill. In the dark theme, outlines SHALL stay low contrast and raised surfaces SHALL read lighter than the canvas rather than relying on black shadows.

#### Scenario: Quiet outlines

- **WHEN** the learner opens Profile in the dark theme
- **THEN** no outline uses the full foreground color and the sheet surfaces are lighter than the background

### Requirement: Calm layout

Screens SHALL group content by spacing, uppercase section labels and hairline dividers instead of wrapping each section, metric or row in an outlined container. Each screen SHALL show at most one highlighted container (a hero panel or a celebration). The primary color SHALL be reserved for the primary action and active progress (including the active tab's icon and indicator); selected segments, links, decorative glyphs and section headings SHALL use neutral colors. Selection changes SHALL give a light selection haptic. Secondary and administrative actions SHALL use a quiet flat button, and destructive confirmations a distinct destructive style. Every button SHALL have the same height on every screen, raised buttons SHALL keep their edge space when disabled so they never change size between states, and primary buttons SHALL span the full available width. The heavy display font SHALL be limited to hero titles, the grade and celebration moments; statistics SHALL use the bold UI font. Metrics such as streak, coverage, today's reviews and round scores SHALL be laid out inline as icon, value and label without borders. Text SHALL use four levels: hero (24 to 30px display), section title (18 to 20px), body (15 to 16px) and metadata (12 to 13px), with secondary text de-emphasized by the muted color. Spacing SHALL follow a 4px grid. The primary action of Home, the Kana screen and a round SHALL sit full width in the lower third, above the navigation and safe area. Interactive targets SHALL be at least 44 points. Loading SHALL show skeleton blocks shaped like the content, honoring reduced motion; errors SHALL appear inline with a retry action.

#### Scenario: One highlighted container on Home

- **WHEN** Home shows today's round, the goal, the duel and both alphabets
- **THEN** only today's round is a raised panel and the other sections are separated by labels and dividers
- **AND** Start sits full width at the bottom above the navigation

#### Scenario: Consistent buttons

- **WHEN** the learner sees Start on Home, Start on Kana and a disabled Check in a round
- **THEN** all three buttons have the same height and the primary ones span the full width

#### Scenario: Inline statistics

- **WHEN** the learner opens Profile with saved reviews
- **THEN** streak, reviewed kana, today's reviews and saved reviews appear as inline icon, value and label pairs without outlined tiles

#### Scenario: Loading Home

- **WHEN** saved progress is still loading
- **THEN** skeleton blocks shaped like the goal and alphabets appear instead of a spinner or zero progress
- **AND** with reduced motion enabled the skeletons do not pulse

#### Scenario: Round results

- **WHEN** the learner finishes a round
- **THEN** the grade stamp and inline scores lead the screen, the daily streak celebration is the only highlighted container, and corrections are a divided list
