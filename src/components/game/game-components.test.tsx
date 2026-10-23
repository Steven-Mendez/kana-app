import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AnimatedProgressBar } from '@/components/game/animated-progress-bar';
import { FeedbackBottomSheet } from '@/components/game/feedback-bottom-sheet';
import { GameButton } from '@/components/game/game-button';
import { KanaCard } from '@/components/game/kana-card';
import { RomajiOptionPill } from '@/components/game/romaji-option-pill';
import { StreakBadge } from '@/components/game/streak-badge';
import { answerHaptic, pressHaptic } from '@/lib/haptics';
import { copy } from '@/lib/copy';
import { kitsunebiCount } from '@/lib/game-combo';

jest.mock('uniwind', () => ({
  useCSSVariable: (names: string[]) => names.map(() => '#806a67'),
}));
jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
  }),
}));
jest.mock('@/lib/haptics', () => ({
  answerHaptic: jest.fn(),
  pressHaptic: jest.fn(),
}));
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<{ default: unknown }>(
    'react-native-reanimated',
  );
  return {
    __esModule: true,
    ...actual,
    default: actual.default,
    useReducedMotion: jest.fn(() => false),
  };
});

const t = copy.en;

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(useReducedMotion).mockReturnValue(false);
  jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('game button presses with a haptic and runs its action', async () => {
  const onPress = jest.fn();
  await render(<GameButton onPress={onPress}>Play!</GameButton>);
  const button = screen.getByRole('button', { name: 'Play!' });
  await fireEvent(button, 'pressIn');
  await fireEvent.press(button);
  expect(pressHaptic).toHaveBeenCalled();
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('a disabled game button reports its state and ignores presses', async () => {
  const onPress = jest.fn();
  await render(
    <GameButton disabled onPress={onPress}>
      Check
    </GameButton>,
  );
  const button = screen.getByRole('button', { name: 'Check' });
  expect(button).toBeDisabled();
  await fireEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
});

test('every button variant renders its label', async () => {
  await render(
    <>
      {(['primary', 'secondary', 'success', 'danger', 'outline'] as const).map(
        (variant) => (
          <GameButton key={variant} variant={variant}>
            {variant}
          </GameButton>
        ),
      )}
    </>,
  );
  for (const variant of [
    'primary',
    'secondary',
    'success',
    'danger',
    'outline',
  ])
    expect(screen.getByRole('button', { name: variant })).toBeOnTheScreen();
});

test('an option card is a selectable button', async () => {
  const onPress = jest.fn();
  await render(
    <KanaCard kana="さ" variant="option" state="selected" onPress={onPress} />,
  );
  const card = screen.getByRole('button', { name: 'さ' });
  expect(card).toBeSelected();
  await fireEvent.press(card);
  expect(onPress).toHaveBeenCalled();
});

test('a correct card shows its reading and announces it', async () => {
  const view = await render(
    <KanaCard kana="つ" variant="hero" reading="tsu" />,
  );
  expect(screen.queryByText('tsu')).toBeNull();
  await view.rerender(
    <KanaCard kana="つ" variant="hero" state="correct" reading="tsu" />,
  );
  expect(screen.getByText('tsu')).toBeOnTheScreen();
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
    t.gameCorrect('tsu'),
  );
});

test('a wrong card flips to show the reading', async () => {
  const view = await render(
    <KanaCard kana="つ" variant="hero" reading="tsu" />,
  );
  await view.rerender(
    <KanaCard kana="つ" variant="hero" state="wrong" reading="tsu" />,
  );
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
    t.gameWrong('tsu'),
  );
  await act(async () => jest.advanceTimersByTime(500));
  expect(screen.getByText('tsu')).toBeOnTheScreen();
  expect(screen.getByLabelText(`つ, ${t.gameWrong('tsu')}`)).toBeOnTheScreen();
});

test('with reduced motion the back appears without waiting for the flip', async () => {
  jest.mocked(useReducedMotion).mockReturnValue(true);
  const view = await render(
    <KanaCard kana="つ" variant="hero" reading="tsu" />,
  );
  await view.rerender(
    <KanaCard kana="つ" variant="hero" state="wrong" reading="tsu" />,
  );
  expect(screen.getByText('tsu')).toBeOnTheScreen();
});

test('a combo of three adds the kitsunebi badge', async () => {
  const view = await render(<KanaCard kana="つ" variant="hero" combo={2} />);
  expect(screen.queryByLabelText(t.gameCombo(2))).toBeNull();
  await view.rerender(<KanaCard kana="つ" variant="hero" combo={5} />);
  expect(screen.getByLabelText(t.gameCombo(5))).toBeOnTheScreen();
  expect(screen.getByText('×5')).toBeOnTheScreen();
});

test('romaji coins press, and used coins are inert', async () => {
  const onPress = jest.fn();
  await render(
    <>
      <RomajiOptionPill romaji="tsu" shortcut={2} onPress={onPress} />
      <RomajiOptionPill romaji="ki" state="used" onPress={onPress} />
    </>,
  );
  await fireEvent.press(screen.getByRole('button', { name: 'tsu' }));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByText('2')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'ki' })).toBeNull();
});

test('kitsunebi light at combos of three, six and nine', () => {
  expect([0, 2, 3, 5, 6, 9, 20].map(kitsunebiCount)).toEqual([
    0, 0, 1, 1, 2, 3, 3,
  ]);
});

test('the progress bar never moves back and quits on request', async () => {
  const onQuit = jest.fn();
  const view = await render(
    <AnimatedProgressBar value={0.6} combo={0} onQuit={onQuit} />,
  );
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 60 });
  await view.rerender(
    <AnimatedProgressBar value={0.4} combo={0} onQuit={onQuit} />,
  );
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 60 });
  await fireEvent.press(screen.getByRole('button', { name: t.gameQuit }));
  expect(onQuit).toHaveBeenCalled();
});

test('streak badges describe the streak in full', async () => {
  await render(
    <>
      <StreakBadge days={32} state="at-risk" />
      <StreakBadge days={0} state="off" />
      <StreakBadge days={1} state="active" />
    </>,
  );
  expect(
    screen.getByLabelText(`${t.streakDays(32)}, ${t.streakAtRisk}`),
  ).toBeOnTheScreen();
  expect(screen.getByLabelText('No streak')).toBeOnTheScreen();
  expect(screen.getByLabelText('1-day streak')).toBeOnTheScreen();
});

test('an ignited streak badge settles on its count, with or without motion', async () => {
  const view = await render(
    <StreakBadge days={4} state="active" ignite delay={0} testID="streak" />,
  );
  await act(async () => jest.advanceTimersByTime(1500));
  expect(screen.getByLabelText(t.streakDays(4))).toBeOnTheScreen();
  expect(screen.getByText('4')).toBeOnTheScreen();

  jest.mocked(useReducedMotion).mockReturnValue(true);
  await view.rerender(
    <StreakBadge days={7} state="milestone" ignite testID="streak" />,
  );
  expect(screen.getByLabelText(t.streakDays(7))).toBeOnTheScreen();
});

test('the feedback ribbon fires its haptic and continues', async () => {
  const onContinue = jest.fn();
  await render(
    <FeedbackBottomSheet
      tone="wrong"
      title="It was tsu"
      message={<Text>You chose shi</Text>}
      continueLabel="Got it"
      onContinue={onContinue}
    />,
  );
  expect(answerHaptic).toHaveBeenCalledWith(false);
  expect(screen.getByText('It was tsu')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Got it' }));
  expect(onContinue).toHaveBeenCalled();
});
