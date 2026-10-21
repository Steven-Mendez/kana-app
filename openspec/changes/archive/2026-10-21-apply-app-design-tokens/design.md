## Decisions

- Keep one theme source in `src/global.css`; do not import the standalone web-only extraction files or introduce a JavaScript palette.
- Store raw OKLCH values in named `--palette-*` primitives. Map semantic `--color-*` variables inside Uniwind's light/dark variants so native parsing and web switching share the same values.
- Preserve `surface` as the card surface, `error` as destructive, and `success` as emerald-600 in light / emerald-400 in dark for existing feedback text. Expose emerald-500 separately as the success fill.
- Include the approved secondary, popover, chart, sidebar, input, and ring tokens without inventing new screens to consume them.
- Keep exact OKLCH on web; Uniwind converts colors to native-compatible values for React Native. Verify resolved native rendering rather than maintaining hand-rounded HEX copies.
- Focus outlines use ring, which intentionally differs from primary in dark mode. The study field uses input for its resting border.
- Input selection/caret also uses ring. Native tab labels/icons use muted foreground and primary; their background uses surface where the platform permits it. iOS 26 controls its own Liquid Glass material. Set `userInterfaceStyle` to `automatic` so native appearance is not locked to light while the existing saved preference still defaults to light.
- Treat the palette as the app's own design system. Product source and documentation use no previous product branding.

## Verification

Inspect actual web computed styles and screenshots in both modes, including selected controls and feedback. Verify iOS navigation, theme changes, selected kana, and free-study correct/incorrect feedback with the keyboard visible. Run existing tests, `pnpm check`, web export, and strict OpenSpec validation. Preserve unrelated staged work.
