import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AudioPlayer } from 'expo-audio';
import { useSyncExternalStore } from 'react';

import { kitsunebiCount } from '@/lib/game-combo';

// Synthesized by scripts/generate-game-sounds.mjs.
const sources = {
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  perfect: require('../../assets/sounds/perfect.wav'),
  streak: require('../../assets/sounds/streak.wav'),
};
export type Sound = keyof typeof sources;

export const soundKey = 'kana-sound';

// Sound is a property of the device, like its volume: stored locally, never synced.
let enabled = true;
let loaded = false;
const listeners = new Set<() => void>();

function loadPreference() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(soundKey).then(
    (value) => {
      if (value === 'off') setSoundEnabled(false, false);
    },
    () => {},
  );
}

export function setSoundEnabled(value: boolean, persist = true) {
  enabled = value;
  listeners.forEach((listener) => listener());
  if (persist)
    AsyncStorage.setItem(soundKey, value ? 'on' : 'off').catch(() => {});
}

export function useSoundEnabled() {
  return useSyncExternalStore(
    (listener) => {
      loadPreference();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => enabled,
  );
}

// A handful of short clips live for the whole app; replaying rewinds them.
const players: Partial<Record<Sound, AudioPlayer>> = {};
let audio: typeof import('expo-audio') | null | undefined;

// Loaded on first use: a build without the native module plays nothing
// instead of crashing at import.
function loadAudio() {
  if (audio !== undefined) return audio;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    audio = require('expo-audio') as typeof import('expo-audio');
    // Respect the silent switch and never pause the learner's own audio.
    audio
      .setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
      })
      .catch(() => {});
  } catch {
    audio = null;
  }
  return audio;
}

function player(sound: Sound) {
  const module = loadAudio();
  if (!module) return null;
  return (players[sound] ??= module.createAudioPlayer(sources[sound]));
}

/** Creates the players ahead of the first answer so it is not delayed. */
export function prepareSounds() {
  loadPreference();
  try {
    (Object.keys(sources) as Sound[]).forEach(player);
  } catch {}
}

// Sounds only accompany visible feedback, so any failure stays silent.
export function playSound(sound: Sound) {
  loadPreference();
  if (!enabled) return;
  try {
    const clip = player(sound);
    if (!clip) return;
    clip.seekTo(0).catch(() => {});
    clip.play();
  } catch {}
}

/** One sound per new grade; lighting a kitsunebi swaps the chime for the combo. */
export function answerSound(correct: boolean, combo: number) {
  playSound(
    !correct
      ? 'wrong'
      : kitsunebiCount(combo) > kitsunebiCount(combo - 1)
        ? 'combo'
        : 'correct',
  );
}
