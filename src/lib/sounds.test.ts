import { beforeAll, beforeEach, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer } from 'expo-audio';

import {
  answerSound,
  playSound,
  setSoundEnabled,
  soundKey,
} from '@/lib/sounds';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);

type Player = { play: jest.Mock; seekTo: jest.Mock };
// Players outlive a test (the module caches them), so keep them here too.
const players: Player[] = [];
const created = () => players;
const plays = () =>
  players.reduce((count, player) => count + player.play.mock.calls.length, 0);

beforeAll(() => {
  jest.mocked(createAudioPlayer).mockImplementation(() => {
    const player = {
      play: jest.fn(),
      seekTo: jest.fn(() => Promise.resolve()),
    };
    players.push(player);
    return player as never;
  });
});
beforeEach(() => {
  setSoundEnabled(true);
});

test('a correct answer chimes, a new kitsunebi swaps in the combo sound', () => {
  answerSound(true, 1);
  answerSound(true, 3);
  answerSound(true, 9);
  answerSound(true, 12);
  answerSound(false, 0);
  // One player per distinct clip: correct, combo, wrong.
  expect(createAudioPlayer).toHaveBeenCalledTimes(3);
  expect(plays()).toBe(5);
  const [correct, combo, wrong] = created();
  expect(correct.play).toHaveBeenCalledTimes(2);
  expect(combo.play).toHaveBeenCalledTimes(2);
  expect(wrong.play).toHaveBeenCalledTimes(1);
  expect(correct.seekTo).toHaveBeenCalledWith(0);
});

test('muting stops every sound and is kept on the device', async () => {
  answerSound(true, 1);
  expect(plays()).toBe(1);
  setSoundEnabled(false);
  playSound('complete');
  answerSound(true, 1);
  expect(plays()).toBe(1);
  await Promise.resolve();
  expect(await AsyncStorage.getItem(soundKey)).toBe('off');
});

test('a failing player never breaks the game', () => {
  jest.mocked(createAudioPlayer).mockImplementationOnce(() => {
    throw new Error('no audio');
  });
  expect(() => playSound('streak')).not.toThrow();
});
