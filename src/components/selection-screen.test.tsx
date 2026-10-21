import { beforeEach, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

import HomeScreen from '@/app/(tabs)/practice';
import { LearningProvider } from '@/lib/learning-provider';
import { resetTestStore } from '@/lib/test-document-store';
import { SelectionProvider } from '@/lib/selection-provider';
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
jest.mock('expo-router', () => {
  const route = {
    navigate: jest.fn(),
    setParams: jest.fn<(mockParams: { section: string }) => void>(),
  };
  return {
    router: route,
    useLocalSearchParams: () => {
      const React = jest.requireActual<typeof import('react')>('react');
      const [params, setParams] = React.useState({ section: 'basic' });
      route.setParams.mockImplementation(setParams);
      return params;
    },
  };
});
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
  }),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  resetTestStore();
  jest.clearAllMocks();
});

test('category and alphabet changes preserve selection; bulk actions remain alphabet-wide and one start respects mode', async () => {
  const t = copy.en;
  Dimensions.set({
    window: { width: 390, height: 844, scale: 1, fontScale: 1 },
  });
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByLabelText(t.selected(5))).toBeOnTheScreen();
  expect(screen.getByRole('tab', { name: 'Hiragana · 5' })).toBeSelected();
  expect(
    within(screen.getByTestId('practice-footer')).getByTestId('study-mode'),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('family-hiragana:a')).toBeChecked();
  await fireEvent.press(screen.getByTestId('kana-hiragana:い'));
  expect(screen.getByLabelText(t.selected(4))).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { checked: 'mixed' })).toBeOnTheScreen();
  expect(screen.getByTestId('kana-hiragana:い')).not.toBeChecked();
  await fireEvent.press(screen.getByTestId('family-hiragana:a'));
  expect(screen.getByTestId('kana-hiragana:い')).toBeChecked();
  expect(screen.getByTestId('cell-hiragana:ya-i')).toBeEmptyElement();
  expect(
    within(screen.getByTestId('cell-hiragana:ya-u')).getByText('ゆ'),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('cell-hiragana:wa-u')).toBeEmptyElement();
  expect(
    within(screen.getByTestId('cell-hiragana:wa-o')).getByText('を'),
  ).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('family-hiragana:ya'));
  expect(screen.getByLabelText(t.selected(8))).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('family-hiragana:ya'));
  expect(screen.queryByTestId('family-hiragana:ga')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('category-voiced'));
  await fireEvent.press(screen.getByTestId('family-hiragana:ga'));
  await fireEvent.press(screen.getByRole('tab', { name: 'Katakana · 0' }));
  await fireEvent.press(screen.getByTestId('category-yoon'));
  await fireEvent.press(screen.getByTestId('family-katakana:kya'));
  expect(screen.getByLabelText(t.selected(13))).toBeOnTheScreen();
  await fireEvent.press(screen.getByText(t.selectAll));
  expect(screen.getByLabelText(t.selected(117))).toBeOnTheScreen();
  await fireEvent.press(screen.getByText(t.clear));
  expect(screen.getByLabelText(t.selected(10))).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('start-study'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: {
      kana: JSON.stringify(
        selectedCards(['hiragana:a', 'hiragana:ga']).map((card) => card.id),
      ),
      mode: 'scheduled',
    },
  });
  expect(screen.queryByTestId('mode-free')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('study-mode'));
  expect(screen.getByTestId('study-mode')).toBeExpanded();
  expect(screen.getByText(t.scheduledHint)).toBeOnTheScreen();
  expect(screen.getByText(t.freeHint)).toBeOnTheScreen();
  expect(screen.getByTestId('mode-scheduled')).toBeChecked();
  await fireEvent.press(screen.getByTestId('study-mode'));
  expect(screen.queryByTestId('mode-options')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('study-mode'));
  expect(screen.getByTestId('mode-scheduled')).toBeChecked();
  await fireEvent.press(screen.getByTestId('mode-free'));
  expect(screen.getByTestId('study-mode')).toBeCollapsed();
  expect(screen.queryByTestId('mode-free')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('start-study'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: {
      kana: JSON.stringify(
        selectedCards(['hiragana:a', 'hiragana:ga']).map((card) => card.id),
      ),
      mode: 'free',
    },
  });
  await fireEvent.press(screen.getByRole('tab', { name: 'Hiragana · 10' }));
  await fireEvent.press(screen.getByTestId('category-basic'));
  expect(screen.getByTestId('family-hiragana:a')).toBeChecked();
  await fireEvent.press(screen.getByText(t.clear));
  expect(screen.getByTestId('start-study')).toBeDisabled();
  expect(screen.getByText(t.emptySelection)).toBeOnTheScreen();
});

test('a single character starts an exact deck and survives remount', async () => {
  const view = await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await screen.findByTestId('start-study');
  await fireEvent.press(screen.getByTestId('clear-selection'));
  await fireEvent.press(screen.getByTestId('kana-hiragana:い'));
  await fireEvent.press(screen.getByTestId('start-study'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: { kana: '["hiragana:い"]', mode: 'scheduled' },
  });
  await view.unmount();
  await render(
    <LearningProvider>
      <SelectionProvider>
        <HomeScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByLabelText(copy.en.selected(1))).toBeOnTheScreen();
  expect(screen.getByTestId('kana-hiragana:い')).toBeChecked();
  expect(screen.getByTestId('kana-hiragana:あ')).not.toBeChecked();
});
