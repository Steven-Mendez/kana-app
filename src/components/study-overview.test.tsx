import { beforeEach, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '@/app/(tabs)/index';
import SyllabaryScreen from '@/app/(tabs)/syllabary';
import { LearningProvider } from '@/lib/learning-provider';
import { learning } from '@/lib/learning';
import { resetTestStore } from '@/lib/test-document-store';
import { SelectionProvider } from '@/lib/selection-provider';
import { reviews } from '@/lib/reviews';
import { selectedCards } from '@/lib/study';
import { copy } from '@/lib/copy';

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
  expect(await screen.findByText(copy.en.noProgress)).toBeOnTheScreen();
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

test('syllabary browsing leaves saved families intact until the explicit family action', async () => {
  await render(
    <LearningProvider>
      <SelectionProvider>
        <SyllabaryScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await act(async () => {});
  await fireEvent.press(screen.getByRole('tab', { name: 'Katakana' }));
  await fireEvent.press(screen.getByLabelText('シ, shi'));
  expect(screen.getByText('Also accepted: si')).toBeOnTheScreen();
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText(copy.en.practiceFamily));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/practice',
    params: { section: 'basic' },
  });
  expect((await learning.read('guest')).selection).toEqual({
    alphabet: 'katakana',
    kanaIds: selectedCards(['katakana:sa']).map((card) => card.id),
  });
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
  await screen.findByText(copy.en.selected(1));
  await fireEvent.press(screen.getByTestId('home-start'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: { kana: '["hiragana:い"]', mode: 'scheduled' },
  });
});
