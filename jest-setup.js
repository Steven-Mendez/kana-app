/* global jest */
require('react-native-reanimated').setUpTests();

// Uniwind ships untranspiled TypeScript; components only read theme colours.
jest.mock('uniwind', () => ({
  useCSSVariable: (names) =>
    Array.isArray(names) ? names.map(() => '#806a67') : '#806a67',
}));

// Native audio is unavailable in Jest; sounds are fire-and-forget anyway.
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));
