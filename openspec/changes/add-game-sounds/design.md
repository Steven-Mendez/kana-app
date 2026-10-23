## Context

Answers, combos and results already have motion and haptics (`src/lib/haptics.ts`). Sound should fire at exactly the same moments, with the same "fire and forget, never fail the game" contract.

## Decisions

- **`expo-audio`.** The recommended Expo module for playback; works on iOS, Android and web. Configured with `microphonePermission: false`, `recordAudioAndroid: false` and `enableBackgroundPlayback: false`, so the build gains no permission or background mode.
- **Long-lived players in `src/lib/sounds.ts`.** One `createAudioPlayer` per clip, created on first need (warmed when a study session mounts) and kept for the app's life: six clips under 1 s are cheaper to keep than to recreate per answer, and replay is `seekTo(0)` + `play()`. Every call is wrapped so a missing module, autoplay block or rejection stays silent.
- **Audio mode.** `playsInSilentMode: false` respects the iOS silent switch and Android silent/vibrate; `interruptionMode: 'mixWithOthers'` never pauses the learner's music.
- **Device-local preference.** Sound is a property of the device (like volume), so it lives in AsyncStorage (`kana-sound`) rather than the synced learning document, which avoids a Supabase migration. A tiny external store backs `useSoundEnabled()`.
- **Original clips.** `scripts/generate-game-sounds.mjs` synthesizes the WAVs (sine/triangle tones with short envelopes) in pentatonic C so they sit together; regenerating is deterministic. 22.05 kHz mono 16-bit keeps every file small.
- **Combo replaces correct.** On the answer that lights a kitsunebi only the combo chime plays, so two clips never stack.

## Risks

- A new native module requires a new development build; Expo Go already includes `expo-audio`.
- Web may block the first sound until a user gesture; answers are always gestures, so only a failed results fanfare after an auto-advance could be lost, which is acceptable.
