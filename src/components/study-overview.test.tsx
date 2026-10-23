import { beforeEach, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '@/app/(tabs)/index';
import { LearningProvider } from '@/lib/learning-provider';
import { resetTestStore, testStore } from '@/lib/test-document-store';
import { createConfusionStore } from '@/lib/confusions';
import { SelectionProvider } from '@/lib/selection-provider';
import { reviews } from '@/lib/reviews';
import { selectedCards } from '@/lib/study';
import { copy } from '@/lib/copy';
import { progressAfter } from '@/lib/test-progress';

jest.mock('@/lib/auth-provider', () => ({
  useAuth: () => ({ session: null }),
}));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/learning-db', () => ({
  learningDb: jest.requireActual<typeof import('@/lib/test-document-store')>(
    '@/lib/test-document-store',
  ).testStore,
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () =>
    jest
      .requireActual<typeof import('node:crypto')>('node:crypto')
      .randomUUID(),
}));
jest.mock('expo-router', () => ({
  Link: jest.requireActual<typeof import('react-native')>('react-native').Text,
  router: { navigate: jest.fn() },
  useFocusEffect: (callback: () => void) =>
    jest
      .requireActual<typeof import('react')>('react')
      .useEffect(callback, [callback]),
}));
jest.mock('@/components/icon', () => ({ Icon: () => null }));
jest.mock('uniwind', () => ({
  useCSSVariable: (names: string | string[]) =>
    Array.isArray(names) ? names.map(() => '#806a67') : '#806a67',
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);
jest.mock('@/components/screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
    preferences: { language: 'en' },
  }),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  resetTestStore();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('home distinguishes unavailable progress from first use, retries and resumes saved families', async () => {
  jest
    .spyOn(reviews, 'load')
    .mockRejectedValueOnce(new Error('Storage unavailable'));
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(screen.queryByText(copy.en.tagline)).not.toBeOnTheScreen();
  expect(await screen.findByText(copy.en.reviewLoadError)).toBeOnTheScreen();
  expect(screen.queryByText(copy.en.noProgress)).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByText(copy.en.retry));
  expect(await screen.findByText(copy.en.firstPractice)).toBeOnTheScreen();
  // First use: no due panel; the goal starts at zero and the duel is locked.
  expect(screen.queryByText(copy.en.noProgress)).not.toBeOnTheScreen();
  expect(screen.getByText(copy.en.homeGoalProgress(0, 5))).toBeOnTheScreen();
  expect(screen.getByText(copy.en.homeDuelLocked)).toBeOnTheScreen();
  expect(screen.queryByTestId('home-duel-start')).not.toBeOnTheScreen();
  expect(screen.getByTestId('home-start')).toHaveTextContent(
    copy.en.startPracticing,
  );
  expect(screen.queryByText(copy.en.continueLearning)).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('home-start'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: {
      kana: JSON.stringify(
        selectedCards(['hiragana:a']).map((card) => card.id),
      ),
      mode: 'scheduled',
      length: '12',
    },
  });
});

test('home keeps continue wording once a review is saved', async () => {
  const now = new Date();
  jest
    .spyOn(reviews, 'load')
    .mockResolvedValue(
      new Map([[selectedCards(['hiragana:a'])[0].id, progressAfter(now)]]),
    );
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByText(copy.en.continueLearning)).toBeOnTheScreen();
  expect(screen.getByTestId('home-start')).toHaveTextContent(
    copy.en.resumeStudy,
  );
});

test('Home resumes a partial character selection without broadening its family', async () => {
  await AsyncStorage.setItem(
    'kana-study-selection',
    JSON.stringify({ alphabet: 'hiragana', kanaIds: ['hiragana:い'] }),
  );
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await screen.findByText(copy.en.homeRoundMeta(1, false));
  await fireEvent.press(screen.getByTestId('home-start'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: { kana: '["hiragana:い"]', mode: 'scheduled', length: '12' },
  });
});

test('Home can start an endless round instead', async () => {
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await fireEvent.press(
    await screen.findByRole('radio', { name: copy.en.homeRoundEndless }),
  );
  expect(screen.getByText(copy.en.homeRoundMeta(5, true))).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('home-start'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: {
      kana: JSON.stringify(
        selectedCards(['hiragana:a']).map((card) => card.id),
      ),
      mode: 'scheduled',
    },
  });
});

test('Home shows due review, the goal and a locked duel once a review is saved', async () => {
  const now = new Date();
  const [a] = selectedCards(['hiragana:a']);
  jest
    .spyOn(reviews, 'load')
    .mockResolvedValue(new Map([[a.id, progressAfter(now)]]));
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByText(copy.en.dueReview)).toBeOnTheScreen();
  expect(screen.getByText(copy.en.homeDuelLocked)).toBeOnTheScreen();
  expect(screen.queryByTestId('home-duel-start')).not.toBeOnTheScreen();
  expect(screen.getByText(copy.en.homeGoalProgress(1, 5))).toBeOnTheScreen();
  expect(screen.getByTestId('home-alphabets')).toBeOnTheScreen();
});

test('Home offers a duel with the most confused pair', async () => {
  const [tsu, shi] = ['つ', 'し'].map((glyph) =>
    selectedCards(['hiragana:ta', 'hiragana:sa']).find(
      (card) => card.kana === glyph,
    )!,
  );
  const store = createConfusionStore(testStore);
  await store.record('guest', 0, tsu.id, shi.id);
  await store.record('guest', 0, shi.id, tsu.id);
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await fireEvent.press(await screen.findByTestId('home-duel-start'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: {
      kana: JSON.stringify([shi.id, tsu.id].sort()),
      length: '8',
    },
  });
});
