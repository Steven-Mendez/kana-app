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

import KanaScreen from '@/app/(tabs)/kana';
import { LearningProvider } from '@/lib/learning-provider';
import { learning } from '@/lib/learning';
import { reviews } from '@/lib/reviews';
import { progressAfter } from '@/lib/test-progress';
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
    useFocusEffect: (callback: () => void) =>
      jest
        .requireActual<typeof import('react')>('react')
        .useEffect(callback, [callback]),
    useLocalSearchParams: () => {
      const React = jest.requireActual<typeof import('react')>('react');
      const [params, setParams] = React.useState({ section: 'basic' });
      route.setParams.mockImplementation(setParams);
      return params;
    },
  };
});
jest.mock('@/components/icon', () => ({ Icon: () => null }));
jest.mock('@/components/kana-strokes', () => ({ KanaStrokes: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
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

async function pickInSheet(id: string) {
  await fireEvent.press(screen.getByTestId(`kana-${id}`));
  await fireEvent.press(screen.getByTestId('kana-toggle'));
  await fireEvent.press(screen.getByTestId('kana-sheet-close'));
}

test('category and alphabet changes preserve selection; bulk actions remain alphabet-wide and one start respects mode', async () => {
  const t = copy.en;
  Dimensions.set({
    window: { width: 390, height: 844, scale: 1, fontScale: 1 },
  });
  await render(
    <LearningProvider>
      <SelectionProvider>
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByLabelText(t.selected(5))).toBeOnTheScreen();
  expect(screen.getByRole('tab', { name: 'Hiragana · 5' })).toBeSelected();
  expect(screen.queryByTestId('mode-free')).not.toBeOnTheScreen();
  expect(screen.getByTestId('family-hiragana:a')).toBeChecked();
  await pickInSheet('hiragana:い');
  expect(screen.getByLabelText(t.selected(4))).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { checked: 'mixed' })).toBeOnTheScreen();
  expect(screen.getByTestId('kana-hiragana:い')).not.toBeSelected();
  await fireEvent.press(screen.getByTestId('family-hiragana:a'));
  expect(screen.getByTestId('kana-hiragana:い')).toBeSelected();
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
  expect(screen.getByText(t.scheduledHint)).toBeOnTheScreen();
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
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await screen.findByTestId('kana-hiragana:い');
  await fireEvent.press(screen.getByTestId('clear-selection'));
  await pickInSheet('hiragana:い');
  await fireEvent.press(screen.getByTestId('start-study'));
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: { kana: '["hiragana:い"]', mode: 'scheduled' },
  });
  await view.unmount();
  await render(
    <LearningProvider>
      <SelectionProvider>
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByLabelText(copy.en.selected(1))).toBeOnTheScreen();
  expect(screen.getByTestId('kana-hiragana:い')).toBeSelected();
  expect(screen.getByTestId('kana-hiragana:あ')).not.toBeSelected();
});

test('the detail sheet explains a kana without changing the selection until its family action', async () => {
  await render(
    <LearningProvider>
      <SelectionProvider>
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  await fireEvent.press(
    await screen.findByRole('tab', { name: 'Katakana · 0' }),
  );
  await fireEvent.press(await screen.findByTestId('kana-katakana:シ'));
  expect(screen.getByText('Also accepted: si')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('kana-sheet-close'));
  expect(screen.getByLabelText(copy.en.selected(5))).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('kana-katakana:シ'));
  await fireEvent.press(screen.getByTestId('practice-family'));
  const family = selectedCards(['katakana:sa']).map((card) => card.id);
  expect(router.navigate).toHaveBeenLastCalledWith({
    pathname: '/study',
    params: {
      kana: JSON.stringify(family),
      mode: 'scheduled',
      length: '12',
    },
  });
  expect((await learning.read('guest')).selection).toEqual({
    alphabet: 'katakana',
    kanaIds: family,
  });
});

test('tiles show saved mastery', async () => {
  const now = new Date();
  const [a] = selectedCards(['hiragana:a']);
  jest
    .spyOn(reviews, 'load')
    .mockResolvedValue(new Map([[a.id, progressAfter(now)]]));
  await render(
    <LearningProvider>
      <SelectionProvider>
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  const t = copy.en;
  expect(
    await screen.findByLabelText(`あ, a, ${t.homeBoardLevel(5)}, ${t.inRound}`),
  ).toBeOnTheScreen();
  expect(
    screen.getByLabelText(`か, ka, ${t.homeBoardUnseen}`),
  ).toBeOnTheScreen();
  expect(screen.getByText(t.coverage(1, 107))).toBeOnTheScreen();
});

test('a progress error offers retry instead of showing zero progress', async () => {
  const t = copy.en;
  jest
    .spyOn(reviews, 'load')
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(new Map());
  await render(
    <LearningProvider>
      <SelectionProvider>
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  expect(await screen.findByText(t.reviewLoadError)).toBeOnTheScreen();
  expect(screen.getByLabelText('か, ka')).toBeOnTheScreen();
  expect(screen.queryByText(t.coverage(0, 107))).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('progress-retry'));
  expect(
    await screen.findByLabelText(`か, ka, ${t.homeBoardUnseen}`),
  ).toBeOnTheScreen();
  expect(screen.queryByText(t.reviewLoadError)).not.toBeOnTheScreen();
});

test('the sheet explains a capped kana and when a mastered one returns', async () => {
  const now = new Date();
  const [a, i] = selectedCards(['hiragana:a']);
  const mastered = { ...progressAfter(now), level: 100 };
  jest.spyOn(reviews, 'load').mockResolvedValue(
    new Map([
      [a.id, progressAfter(now, true, true, true, true)],
      [i.id, mastered],
    ]),
  );
  await render(
    <LearningProvider>
      <SelectionProvider>
        <KanaScreen />
      </SelectionProvider>
    </LearningProvider>,
  );
  const t = copy.en;
  await fireEvent.press(
    await screen.findByLabelText(
      `あ, a, ${t.homeBoardLevel(20)}, ${t.inRound}`,
    ),
  );
  expect(screen.getByTestId('kana-sheet-note')).toHaveTextContent(
    t.masteryCappedToday,
  );
  await fireEvent.press(screen.getByTestId('kana-sheet-close'));
  await fireEvent.press(screen.getByTestId(`kana-${i.id}`));
  expect(screen.getByTestId('kana-sheet-note')).toHaveTextContent(
    t.nextReview(mastered.due.toLocaleDateString('en')),
  );
});
