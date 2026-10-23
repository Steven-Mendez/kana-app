import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { StudySession } from '@/components/study-session';
import { cards } from '@/data/kana';
import { copy } from '@/lib/copy';
import { answerHaptic, celebrateHaptic } from '@/lib/haptics';
import type { ReviewRequest } from '@/lib/review-storage';
import { playSound } from '@/lib/sounds';

jest.mock('expo-crypto', () => ({
  randomUUID: () =>
    jest
      .requireActual<typeof import('node:crypto')>('node:crypto')
      .randomUUID(),
}));
jest.mock('expo-router', () => ({ router: { dismissTo: jest.fn() } }));
jest.mock('@/components/icon', () => ({ Icon: () => null }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);
jest.mock('uniwind', () => ({
  useCSSVariable: (names: string | string[]) =>
    Array.isArray(names) ? names.map(() => '#806a67') : '#806a67',
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
    preferences: { language: 'en', theme: 'light' },
  }),
}));
jest.mock('@/lib/sounds', () => ({
  answerSound: jest.fn(),
  playSound: jest.fn(),
  prepareSounds: jest.fn(),
}));
jest.mock('@/lib/haptics', () => ({
  answerHaptic: jest.fn(),
  pressHaptic: jest.fn(),
  selectHaptic: jest.fn(),
  celebrateHaptic: jest.fn(),
}));

const t = copy.en;
const kana = (glyph: string) => cards.find((card) => card.kana === glyph)!;

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2026-10-22T10:00:00.000Z') });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const coin = (reading: string) => screen.getByRole('button', { name: reading });
const check = () => screen.getByTestId('check-answer');

test('touch rounds answer with coins: Check waits for a coin and grades it once', async () => {
  await render(<StudySession cards={[kana('つ')]} inputMode="touch" />);
  expect(screen.queryByTestId('romaji-input')).toBeNull();
  expect(check()).toBeDisabled();
  await fireEvent.press(coin('tsu'));
  expect(coin('tsu')).toBeSelected();
  await fireEvent.press(check());
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
  expect(answerHaptic).toHaveBeenCalledTimes(1);
  expect(answerHaptic).toHaveBeenCalledWith(true);
  expect(screen.getByText(t.gameNice)).toBeOnTheScreen();
  // Correct feedback stays until Continue: it never moves on by itself.
  await act(async () => jest.advanceTimersByTime(3000));
  expect(screen.getByText(t.gameNice)).toBeOnTheScreen();
  await fireEvent.press(screen.getByText(t.gameContinue));
  expect(screen.queryByText(t.gameNice)).toBeNull();
  expect(check()).toBeDisabled();
});

test('a wrong coin flips the card, records the confusion and waits for Continue', async () => {
  const onConfusion = jest.fn();
  await render(
    <StudySession
      cards={[kana('つ')]}
      inputMode="touch"
      onConfusion={onConfusion}
    />,
  );
  const coins = screen.getAllByTestId(/^coin-/);
  expect(coins).toHaveLength(3);
  const wrong = coins.find((button) => button.props.testID !== 'coin-tsu')!;
  const reading = wrong.props.testID.slice('coin-'.length) as string;
  await fireEvent.press(wrong);
  await fireEvent.press(check());
  expect(answerHaptic).toHaveBeenCalledWith(false);
  expect(screen.getByText(t.gameItWas('tsu'))).toBeOnTheScreen();
  expect(screen.getByLabelText(`つ, ${t.gameWrong('tsu')}`)).toBeOnTheScreen();
  const confused = cards.find(
    (card) => card.alphabet === 'hiragana' && card.reading === reading,
  )!;
  expect(onConfusion).toHaveBeenCalledWith(kana('つ').id, confused.id);
  await act(async () => jest.advanceTimersByTime(5000));
  expect(screen.getByText(t.gameItWas('tsu'))).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: t.gameGotIt }));
  expect(screen.queryByText(t.gameItWas('tsu'))).toBeNull();
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
});

test('skip reveals the reading as a mistake without recording a confusion', async () => {
  const onConfusion = jest.fn();
  await render(
    <StudySession
      cards={[kana('あ')]}
      inputMode="touch"
      onConfusion={onConfusion}
    />,
  );
  await fireEvent.press(screen.getByRole('button', { name: t.gameSkip }));
  expect(screen.getByText(t.gameSkipped)).toBeOnTheScreen();
  expect(onConfusion).not.toHaveBeenCalled();
});

test('a finite round ends in results after its last answer', async () => {
  await render(<StudySession cards={[kana('あ'), kana('い')]} length={3} />);
  for (let answer = 0; answer < 3; answer++) {
    expect(screen.queryByText(t.gameRoundComplete)).toBeNull();
    const prompt = screen.getByTestId('study-prompt');
    const reading = prompt.props.accessibilityLabel === 'あ' ? 'a' : 'i';
    await fireEvent.changeText(screen.getByTestId('romaji-input'), reading);
    await act(async () => jest.advanceTimersByTime(250));
  }
  expect(screen.getByText(t.gameRoundComplete)).toBeOnTheScreen();
  expect(screen.getByText(t.perfect)).toBeOnTheScreen();
  expect(screen.getByLabelText(t.gameGrade('S'))).toBeOnTheScreen();
  expect(screen.getByLabelText(`${t.gamePoints}: 35`)).toBeOnTheScreen();
  expect(screen.queryByLabelText(`${t.gameBestCombo}: ×3`)).toBeNull();
  expect(screen.getByTestId('result-best-streak')).toHaveAccessibleName(
    `${t.bestStreak}: 3`,
  );
  expect(celebrateHaptic).toHaveBeenCalledTimes(1);
  expect(jest.mocked(playSound).mock.calls).toEqual([['perfect']]);
});

test('free-practice results offer Change selection back to the kana list', async () => {
  const { router } = jest.requireMock<{
    router: { dismissTo: jest.Mock };
  }>('expo-router');
  await render(<StudySession cards={[kana('あ')]} />);
  await fireEvent.press(screen.getByRole('button', { name: t.reveal }));
  await fireEvent.press(screen.getByTestId('finish-study'));
  expect(screen.getByText(t.gameRoundComplete)).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: t.review })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: t.repeat })).toBeOnTheScreen();
  expect(screen.getByText(`✕ ${t.revealedShort}`)).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('results-change-selection'));
  expect(router.dismissTo).toHaveBeenCalledWith('/kana');
});

test('a scheduled finite round only ends once its last review is saved', async () => {
  let resolve!: () => void;
  const commit = jest.fn(
    (_request: ReviewRequest) =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  await render(
    <StudySession cards={[kana('あ')]} length={1} onCommitReview={commit} />,
  );
  await fireEvent.changeText(screen.getByTestId('romaji-input'), 'a');
  expect(commit).toHaveBeenCalledTimes(1);
  expect(commit.mock.calls[0][0].rating).toBe(3);
  await act(async () => jest.advanceTimersByTime(5000));
  expect(screen.queryByText(t.gameRoundComplete)).toBeNull();
  await act(async () => resolve());
  await act(async () => jest.advanceTimersByTime(300));
  expect(screen.getByText(t.gameRoundComplete)).toBeOnTheScreen();
  expect(commit).toHaveBeenCalledTimes(1);
});

test('results celebrate a daily streak extended by this round', async () => {
  await render(
    <StudySession
      cards={[kana('あ')]}
      length={1}
      streak={{
        before: { days: 6, state: 'at-risk' },
        after: { days: 7, state: 'active' },
      }}
    />,
  );
  await fireEvent.changeText(screen.getByTestId('romaji-input'), 'a');
  await act(async () => jest.advanceTimersByTime(250));
  expect(screen.getByTestId('result-daily-streak')).toBeOnTheScreen();
  expect(screen.getByText(t.gameStreakMilestone)).toBeOnTheScreen();
  expect(jest.mocked(playSound).mock.calls).toEqual([['perfect']]);
  await act(async () => jest.advanceTimersByTime(600));
  expect(jest.mocked(playSound).mock.calls).toEqual([['perfect'], ['streak']]);
});

test('no celebration when the streak was already kept today', async () => {
  await render(
    <StudySession
      cards={[kana('あ')]}
      length={1}
      streak={{
        before: { days: 7, state: 'active' },
        after: { days: 7, state: 'active' },
      }}
    />,
  );
  await fireEvent.changeText(screen.getByTestId('romaji-input'), 'a');
  await act(async () => jest.advanceTimersByTime(250));
  expect(screen.getByText(t.gameRoundComplete)).toBeOnTheScreen();
  expect(screen.queryByTestId('result-daily-streak')).toBeNull();
  await act(async () => jest.advanceTimersByTime(600));
  expect(jest.mocked(playSound).mock.calls).toEqual([['perfect']]);
});

test('a round with mistakes ends with the completion fanfare', async () => {
  await render(<StudySession cards={[kana('あ')]} length={1} />);
  await fireEvent.press(screen.getByRole('button', { name: t.reveal }));
  await fireEvent.press(screen.getByRole('button', { name: t.next }));
  expect(screen.getByText(t.gameRoundComplete)).toBeOnTheScreen();
  expect(jest.mocked(playSound).mock.calls).toEqual([['complete']]);
});
