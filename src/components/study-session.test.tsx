import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
  within,
} from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { ScheduledStudy } from '@/components/scheduled-study';
import { StudySession } from '@/components/study-session';
import { cards } from '@/data/kana';
import { copy } from '@/lib/copy';
import {
  algorithm,
  replayEvents,
  type LearningEvent,
} from '@/lib/learning-domain';
import type { ReviewRequest } from '@/lib/review-storage';
import { reviews } from '@/lib/reviews';
import { answerHaptic } from '@/lib/haptics';
import { answerSound } from '@/lib/sounds';
import { hydrateProgress } from '@/lib/kana-mastery';
import { progressAfter } from '@/lib/test-progress';

jest.mock('expo-crypto', () => ({
  randomUUID: () =>
    jest
      .requireActual<typeof import('node:crypto')>('node:crypto')
      .randomUUID(),
}));
jest.mock('expo-router', () => ({ router: { dismissTo: jest.fn() } }));
jest.mock('@/components/icon', () => ({ Icon: () => null }));
jest.mock('uniwind', () => ({ useCSSVariable: () => '#806a67' }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
    preferences: { language: 'en', theme: 'light' },
    notice: '',
  }),
}));
jest.mock('@/lib/learning-provider', () => ({
  useLearning: () => ({
    reviews:
      jest.requireMock<typeof import('@/lib/reviews')>('@/lib/reviews').reviews,
    document: { events: [], generation: 0 },
  }),
}));
jest.mock('@/lib/reviews', () => ({
  reviews: { load: jest.fn(), commit: jest.fn() },
}));
jest.mock('@/lib/sounds', () => ({
  answerSound: jest.fn(),
  playSound: jest.fn(),
  prepareSounds: jest.fn(),
}));
jest.mock('@/lib/haptics', () => ({
  answerHaptic: jest.fn(),
  pressHaptic: jest.fn(),
  celebrateHaptic: jest.fn(),
  selectHaptic: jest.fn(),
}));

const now = new Date('2026-03-08T06:55:00.000Z');
const t = copy.en;
const deck = cards.slice(0, 2);

async function enter() {
  const input = screen.getByTestId('romaji-input');
  await fireEvent(input, 'submitEditing', {
    nativeEvent: { text: input.props.value },
  });
}

async function finishPractice() {
  await fireEvent.press(screen.getByTestId('finish-study'));
}

async function advanceFeedback() {
  await act(async () => jest.advanceTimersByTime(250));
}

beforeEach(() => {
  jest.useFakeTimers({ now });
  jest.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('correct typing commits once, blocks advancement while saving, then advances without repeating the same kana', async () => {
  const user = userEvent.setup();
  let finish!: () => void;
  const commit = jest.fn(
    (_request: ReviewRequest) =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  await render(<StudySession cards={deck} onCommitReview={commit} />);
  const input = screen.getByLabelText(t.romaji(deck[0].kana, 'Hiragana'));
  await user.type(input, deck[0].reading);
  await enter();
  await enter();
  expect(commit).toHaveBeenCalledTimes(1);
  expect(commit).toHaveBeenCalledWith(
    expect.objectContaining({
      cardId: deck[0].id,
      rating: 3,
      reviewedAt: now,
    }),
  );
  expect(screen.getByText(t.reviewSaving)).toBeOnTheScreen();
  expect(screen.getByTestId('finish-study')).toBeDisabled();
  expect(screen.getByRole('button', { name: t.next })).toBeDisabled();
  expect(
    screen.getByText(`${t.correct} · ${deck[0].reading}`),
  ).toBeOnTheScreen();
  await act(async () => {
    finish();
  });
  expect(screen.getByRole('button', { name: t.next })).toBeEnabled();
  await advanceFeedback();
  expect(
    screen.getByLabelText(t.romaji(deck[1].kana, 'Hiragana')),
  ).toHaveDisplayValue('');
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
  expect(screen.getByTestId('romaji-input')).toBe(input);
});

test('a wrong draft can be erased and corrected without Enter or an incorrect grade', async () => {
  const e = cards.find((card) => card.kana === 'え')!;
  const commit = jest.fn(async (_request: ReviewRequest) => {});
  await render(<StudySession cards={[e]} onCommitReview={commit} />);
  const input = screen.getByTestId('romaji-input');
  for (const draft of ['a', 'x', '']) {
    await fireEvent.changeText(input, draft);
    expect(screen.queryByTestId('answer-feedback')).not.toBeOnTheScreen();
    expect(commit).not.toHaveBeenCalled();
  }
  await fireEvent.changeText(input, 'e');
  expect(commit).toHaveBeenCalledWith(expect.objectContaining({ rating: 3 }));
  await advanceFeedback();
  expect(screen.queryByText(t.scheduledComplete)).not.toBeOnTheScreen();
  await finishPractice();
  expect(screen.getByText(t.scheduledComplete)).toBeOnTheScreen();
});

test('n/nn extensions and pasted aliases do not leak a trailing character to the next card', async () => {
  const n = cards.find((card) => card.kana === 'ん')!;
  const commit = jest.fn(async (_request: ReviewRequest) => {});
  await render(<StudySession cards={[n, deck[0]]} onCommitReview={commit} />);
  const input = screen.getByTestId('romaji-input');
  const change = input.props.onChangeText;
  await act(async () => {
    change('n');
    change('nn');
    change('nn');
  });
  expect(commit).toHaveBeenCalledTimes(1);
  expect(input).toHaveDisplayValue('nn');
  await advanceFeedback();
  expect(screen.getByTestId('study-prompt')).toHaveTextContent('あ');
  expect(input).toHaveDisplayValue('');
  await act(async () => change('nn'));
  expect(input).toHaveDisplayValue('');
  await fireEvent.changeText(input, ' A ');
  await advanceFeedback();
  expect(commit).toHaveBeenCalledTimes(2);
  expect(screen.queryByText(t.scheduledComplete)).not.toBeOnTheScreen();
  await finishPractice();
  expect(screen.getByText(t.scheduledComplete)).toBeOnTheScreen();
});

test('wrong Enter shows and announces the reading at once, then a second Enter continues', async () => {
  const previousOS = process.env.EXPO_OS;
  process.env.EXPO_OS = 'ios';
  const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
  const shi = cards.find((card) => card.kana === 'し')!;
  const commit = jest.fn(async (_request: ReviewRequest) => {});
  try {
    await render(<StudySession cards={[shi]} onCommitReview={commit} />);
    const input = screen.getByTestId('romaji-input');
    await fireEvent.changeText(input, 'wrong');
    await enter();
    expect(input).toHaveDisplayValue('wrong');
    expect(screen.getByTestId('answer-feedback')).toHaveTextContent(
      `${t.incorrect} · shi${t.yourAnswer('wrong')}`,
    );
    expect(announce).toHaveBeenLastCalledWith(
      `${t.incorrect}. ${t.reading('し', 'shi')} ${t.yourAnswer('wrong')}`,
    );
    expect(screen.getByRole('button', { name: t.next })).toBeEnabled();
    await act(async () => jest.advanceTimersByTime(5000));
    expect(input).toHaveDisplayValue('wrong');
    expect(commit).toHaveBeenCalledTimes(1);
    const next = input.props.onSubmitEditing;
    await act(async () => {
      next({ nativeEvent: { text: 'wrong' } });
      next({ nativeEvent: { text: 'wrong' } });
    });
    expect(input).toHaveDisplayValue('');
    expect(screen.queryByTestId('answer-feedback')).not.toBeOnTheScreen();
    expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(t.scheduledComplete)).not.toBeOnTheScreen();
    await finishPractice();
    expect(screen.getByText(t.scheduledComplete)).toBeOnTheScreen();
  } finally {
    if (previousOS === undefined) delete process.env.EXPO_OS;
    else process.env.EXPO_OS = previousOS;
  }
});

test.each(['wrong', 'reveal'] as const)(
  '%s is Again; blank submissions produce no review',
  async (answer) => {
    const user = userEvent.setup();
    const commit = jest.fn(async (_request: ReviewRequest) => {});
    await render(<StudySession cards={[deck[0]]} onCommitReview={commit} />);
    await user.press(screen.getByRole('button', { name: t.check }));
    expect(screen.getByText(t.needsAnswer)).toBeOnTheScreen();
    expect(commit).not.toHaveBeenCalled();
    if (answer === 'wrong') {
      await user.type(screen.getByPlaceholderText('Rōmaji'), 'wrong');
      await user.press(screen.getByRole('button', { name: t.check }));
    } else await user.press(screen.getByRole('button', { name: t.reveal }));
    expect(commit).toHaveBeenCalledWith(expect.objectContaining({ rating: 1 }));
    expect(screen.getByText(t.reviewSaved)).toBeOnTheScreen();
    await advanceFeedback();
    expect(screen.queryByText(t.scheduledComplete)).not.toBeOnTheScreen();
    if (answer === 'wrong') {
      expect(screen.getByTestId('romaji-input')).toHaveDisplayValue('wrong');
      expect(screen.getByTestId('answer-feedback')).toHaveTextContent(
        `${t.incorrect} · a${t.yourAnswer('wrong')}`,
      );
      expect(commit).toHaveBeenCalledTimes(1);
    }
    await enter();
    expect(screen.queryByText(t.scheduledComplete)).not.toBeOnTheScreen();
    await finishPractice();
    expect(screen.getByText(t.scheduledComplete)).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: t.repeat }),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: t.review }),
    ).not.toBeOnTheScreen();
  },
);

test('a failed save retries the original rating, identity, and timestamp', async () => {
  const user = userEvent.setup();
  const commit = jest
    .fn(async (_request: ReviewRequest) => {})
    .mockRejectedValueOnce(new Error('offline storage'));
  await render(<StudySession cards={[deck[0]]} onCommitReview={commit} />);
  await user.press(screen.getByRole('button', { name: t.reveal }));
  expect(await screen.findByRole('alert')).toHaveTextContent(t.reviewSaveError);
  expect(screen.getByTestId('finish-study')).toBeDisabled();
  // Retry takes the place of Next until the review is saved.
  expect(screen.queryByRole('button', { name: t.next })).toBeNull();
  jest.setSystemTime(new Date('2026-03-09T06:55:00.000Z'));
  await user.press(screen.getByTestId('study-retry'));
  expect(commit).toHaveBeenCalledTimes(2);
  expect(commit.mock.calls[1][0]).toEqual(commit.mock.calls[0][0]);
  expect(screen.getByRole('button', { name: t.next })).toBeEnabled();
  expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
});

test('free-practice mistake drills remain transient and never touch review storage', async () => {
  const user = userEvent.setup();
  await render(<StudySession cards={[deck[0]]} />);
  await user.press(screen.getByRole('button', { name: t.reveal }));
  await enter();
  await finishPractice();
  await user.press(screen.getByRole('button', { name: t.review }));
  expect(screen.getByText(t.answered(0), { exact: false })).toBeOnTheScreen();
  await user.type(screen.getByPlaceholderText('Rōmaji'), deck[0].reading);
  await advanceFeedback();
  expect(screen.queryByText(t.perfect)).not.toBeOnTheScreen();
  await finishPractice();
  expect(screen.getByText(t.perfect)).toBeOnTheScreen();
  expect(reviews.commit).not.toHaveBeenCalled();
  expect(reviews.load).not.toHaveBeenCalled();
});

test('success keeps the input mounted and lets early typing interrupt feedback without losing characters', async () => {
  jest
    .mocked(Math.random)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.999);
  await render(<StudySession cards={cards.slice(0, 3)} />);
  const input = screen.getByTestId('romaji-input');
  expect(input.props.autoFocus).toBe(true);
  expect(input.props.submitBehavior).toBe('submit');
  await fireEvent.changeText(input, ' A ');
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
  expect(screen.getByTestId('answer-feedback')).toHaveTextContent(
    `${t.correct} · a`,
  );
  expect(input).toHaveDisplayValue(' A ');
  await fireEvent.changeText(input, ' A i');
  await act(async () => jest.advanceTimersByTime(0));
  expect(screen.getByTestId('study-prompt')).toHaveTextContent('い');
  expect(screen.getByTestId('romaji-input')).toBe(input);
  expect(input).toHaveDisplayValue('i');
  await act(async () => jest.advanceTimersByTime(0));
  expect(screen.getByText(t.answered(2), { exact: false })).toBeOnTheScreen();
  await advanceFeedback();
  expect(screen.getByTestId('study-prompt')).toHaveTextContent('う');
  expect(input).toHaveDisplayValue('');
  await fireEvent.changeText(input, 'u');
  await advanceFeedback();
  expect(screen.queryByText(t.perfect)).not.toBeOnTheScreen();
  await finishPractice();
  expect(screen.getByText(t.perfect)).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: t.repeat }));
  expect(screen.getByTestId('romaji-input')).toHaveDisplayValue('');
  expect(screen.getByTestId('romaji-input').props.autoFocus).toBe(true);
  expect(screen.getByText(t.answered(0), { exact: false })).toBeOnTheScreen();
});

test('duplicates and old handlers cannot grade, advance, or edit a later card or restarted round', async () => {
  await render(<StudySession cards={deck} />);
  const input = screen.getByTestId('romaji-input');
  await fireEvent.changeText(input, 'a');
  const oldSubmit = input.props.onSubmitEditing;
  const oldInput = input.props.onChangeText;
  await act(async () => {
    oldSubmit({ nativeEvent: { text: 'a' } });
    oldSubmit({ nativeEvent: { text: 'a' } });
  });
  const oldNext = input.props.onSubmitEditing;
  await advanceFeedback();
  await act(async () => {
    oldNext({ nativeEvent: { text: '' } });
    oldSubmit({ nativeEvent: { text: 'a' } });
    oldInput('a');
  });
  await fireEvent(input, 'submitEditing', { nativeEvent: { text: 'a' } });
  expect(input).toHaveDisplayValue('');
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
  await fireEvent.changeText(input, 'i');
  await enter();
  await advanceFeedback();
  await finishPractice();
  await fireEvent.press(screen.getByRole('button', { name: t.repeat }));
  await act(async () => {
    oldSubmit({ nativeEvent: { text: 'a' } });
    oldInput('a');
    oldNext({ nativeEvent: { text: '' } });
  });
  expect(screen.getByText(t.answered(0), { exact: false })).toBeOnTheScreen();
  expect(screen.getByTestId('romaji-input')).toHaveDisplayValue('');
});

test.each(['wrong', 'reveal'] as const)(
  '%s keeps feedback and keyboard input until Enter, then drops interim text',
  async (answer) => {
    await render(<StudySession cards={deck} />);
    const input = screen.getByTestId('romaji-input');
    if (answer === 'wrong') {
      await fireEvent.changeText(input, 'wrong');
      await enter();
    } else
      await fireEvent.press(screen.getByRole('button', { name: t.reveal }));
    await fireEvent.changeText(input, 'discard');
    await act(async () => jest.advanceTimersByTime(5000));
    expect(screen.getByTestId('study-prompt')).toHaveTextContent(/^あ/);
    expect(screen.getByTestId('answer-feedback')).toHaveTextContent(
      answer === 'wrong'
        ? `${t.incorrect} · a${t.yourAnswer('wrong')}`
        : `${t.revealed} · a`,
    );
    const next = input.props.onSubmitEditing;
    await act(async () => {
      next({ nativeEvent: { text: 'discard' } });
      next({ nativeEvent: { text: 'discard' } });
    });
    expect(screen.getByTestId('romaji-input')).toBe(input);
    expect(input).toHaveDisplayValue('');
    expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
    expect(screen.getByTestId('study-prompt')).toHaveTextContent('い');
  },
);

test('slow saving and keyboard retry retain the review and buffered next answer', async () => {
  let fail!: (error: Error) => void;
  let finish!: () => void;
  const commit = jest
    .fn(
      (_request: ReviewRequest) =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          fail = reject;
        }),
    );
  await render(<StudySession cards={deck} onCommitReview={commit} />);
  const input = screen.getByTestId('romaji-input');
  await fireEvent.changeText(input, 'a');
  await enter();
  await fireEvent.changeText(input, 'i');
  await enter();
  await act(async () => jest.advanceTimersByTime(5000));
  expect(commit).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('study-prompt')).toHaveTextContent(/^あ/);
  expect(input).toHaveDisplayValue('i');
  await act(async () => fail(new Error('disk full')));
  expect(screen.getByRole('alert')).toHaveTextContent(t.reviewSaveError);
  jest.setSystemTime(new Date('2026-03-09'));
  await enter();
  await enter();
  expect(commit).toHaveBeenCalledTimes(2);
  expect(commit.mock.calls[1][0]).toBe(commit.mock.calls[0][0]);
  expect(input).toHaveDisplayValue('i');
  await act(async () => finish());
  await act(async () => jest.advanceTimersByTime(0));
  expect(screen.getByTestId('study-prompt')).toHaveTextContent('い');
  expect(input).toHaveDisplayValue('i');
  await act(async () => jest.advanceTimersByTime(0));
  expect(screen.getByText(t.answered(2), { exact: false })).toBeOnTheScreen();
  expect(commit).toHaveBeenCalledTimes(3);
  expect(commit.mock.calls[2][0].cardId).toBe(deck[1].id);
  await act(async () => finish());
  await advanceFeedback();
  expect(screen.queryByText(t.scheduledComplete)).not.toBeOnTheScreen();
  await finishPractice();
  expect(screen.getByText(t.scheduledComplete)).toBeOnTheScreen();
});

test('accepted aliases grade without Enter and a single selected card repeats until explicit finish', async () => {
  const shi = cards.find((card) => card.kana === 'し')!;
  await render(<StudySession cards={[shi]} />);
  const input = screen.getByTestId('romaji-input');
  await fireEvent.changeText(input, ' SI ');
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
  expect(screen.getByTestId('answer-feedback')).toHaveTextContent(
    `${t.correct} · shi`,
  );
  await advanceFeedback();
  expect(screen.queryByText('100%')).not.toBeOnTheScreen();
  expect(screen.getByTestId('romaji-input')).toBe(input);
  await finishPractice();
  expect(screen.getByText('100%')).toBeOnTheScreen();
});

test('typing and submitting in the same event batch uses the latest draft exactly once', async () => {
  await render(<StudySession cards={deck} />);
  const input = screen.getByTestId('romaji-input');
  const change = input.props.onChangeText;
  const submit = input.props.onSubmitEditing;
  await act(async () => {
    change('a');
    submit({ nativeEvent: { text: 'a' } });
    submit({ nativeEvent: { text: 'a' } });
  });
  expect(screen.getByText(t.answered(1), { exact: false })).toBeOnTheScreen();
  await advanceFeedback();
  expect(screen.getByTestId('study-prompt')).toHaveTextContent('い');
  expect(input).toHaveDisplayValue('');
});

test('unmount cancels automatic progression and late save completion', async () => {
  const timeout = jest.spyOn(global, 'setTimeout');
  const clear = jest.spyOn(global, 'clearTimeout');
  const session = await render(<StudySession cards={deck} />);
  await fireEvent.changeText(screen.getByTestId('romaji-input'), 'a');
  await enter();
  const timerIndex = timeout.mock.calls.findIndex((call) => call[1] === 250);
  expect(timerIndex).toBeGreaterThanOrEqual(0);
  const timer = timeout.mock.results[timerIndex].value;
  await session.unmount();
  expect(clear.mock.calls.some(([id]) => id === timer)).toBe(true);
  timeout.mockClear();
  let finish!: () => void;
  const commit = jest.fn(
    (_request: ReviewRequest) =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const scheduled = await render(
    <StudySession cards={deck} onCommitReview={commit} />,
  );
  await fireEvent.changeText(screen.getByTestId('romaji-input'), 'a');
  await enter();
  await scheduled.unmount();
  await act(async () => finish());
  expect(timeout.mock.calls.filter((call) => call[1] === 250)).toHaveLength(0);
});

test('scheduled loading exposes a retryable error, next-due time, and refreshes when due', async () => {
  const user = userEvent.setup();
  const saved = progressAfter(now);
  jest
    .mocked(reviews.load)
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockResolvedValue(new Map([[deck[0].id, saved]]));
  await render(<ScheduledStudy cards={[deck[0]]} dueOnly />);
  expect(await screen.findByRole('alert')).toHaveTextContent(t.reviewLoadError);
  await user.press(screen.getByRole('button', { name: t.retry }));
  expect(await screen.findByText(t.nothingDue)).toBeOnTheScreen();
  expect(
    screen.getByText(t.nextReview(saved.due.toLocaleString('en'))),
  ).toBeOnTheScreen();
  jest.setSystemTime(saved.due);
  await user.press(screen.getByRole('button', { name: t.refreshReviews }));
  expect(await screen.findByPlaceholderText('Rōmaji')).toBeOnTheScreen();
  expect(reviews.load).toHaveBeenCalledTimes(3);
});

test('due-only rounds never introduce a card that has no saved progress', async () => {
  jest.mocked(reviews.load).mockResolvedValueOnce(new Map());
  await render(<ScheduledStudy cards={[cards[0]]} dueOnly />);
  expect(await screen.findByText(t.nothingDue)).toBeOnTheScreen();
  expect(screen.queryByTestId('romaji-input')).not.toBeOnTheScreen();
});

test('typing summary retains original mistakes and resets session streak when reviewing', async () => {
  await render(<StudySession cards={cards.slice(0, 3)} />);
  const input = screen.getByTestId('romaji-input');
  const feedbackSlot = screen.getByTestId('typing-feedback-slot');
  await fireEvent.changeText(input, 'a');
  expect(screen.queryByTestId('study-streak')).not.toBeOnTheScreen();
  expect(screen.getByTestId('typing-feedback-slot')).toBe(feedbackSlot);
  await advanceFeedback();
  await fireEvent.changeText(input, 'wrong');
  await enter();
  expect(screen.queryByTestId('study-streak')).not.toBeOnTheScreen();
  await fireEvent.changeText(input, 'edited');
  await enter();
  await fireEvent.press(screen.getByRole('button', { name: t.reveal }));
  await enter();
  await finishPractice();
  expect(screen.getByLabelText(`${t.bestStreak}: 1`)).toBeOnTheScreen();
  // Corrections carry a status mark before the submitted answer.
  expect(
    screen.getByText(t.yourAnswer('wrong'), { exact: false }),
  ).toBeOnTheScreen();
  expect(
    screen.queryByText(t.yourAnswer('edited'), { exact: false }),
  ).not.toBeOnTheScreen();
  expect(screen.getByText(t.revealedShort, { exact: false })).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: t.review }));
  expect(screen.queryByTestId('study-streak')).not.toBeOnTheScreen();
  expect(screen.getByTestId('romaji-input')).toHaveDisplayValue('');
});

test('the header summarizes answers and shows the streak from two in a row', async () => {
  await render(<StudySession cards={cards.slice(0, 3)} />);
  const input = screen.getByTestId('romaji-input');
  await fireEvent.changeText(input, 'a');
  expect(screen.getByTestId('study-summary')).toHaveTextContent(
    `${t.answered(1)} · ${t.correctCount(1)}`,
  );
  expect(screen.queryByTestId('study-streak')).not.toBeOnTheScreen();
  await advanceFeedback();
  await fireEvent.changeText(input, 'i');
  expect(screen.getByTestId('study-streak')).toBeOnTheScreen();
  expect(screen.getByTestId('study-summary')).toHaveTextContent(
    `${t.answered(2)} · ${t.correctCount(2)} · ${t.streakCount(2)}`,
  );
});

test('each new grade triggers exactly one matching haptic', async () => {
  const haptic = jest.mocked(answerHaptic);
  haptic.mockClear();
  await render(<StudySession cards={deck} />);
  const input = screen.getByTestId('romaji-input');
  await fireEvent.changeText(input, 'a');
  await fireEvent.changeText(input, 'a');
  expect(haptic.mock.calls).toEqual([[true]]);
  await advanceFeedback();
  await fireEvent.changeText(input, 'wrong');
  await enter();
  await fireEvent.press(screen.getByRole('button', { name: t.next }));
  expect(haptic.mock.calls).toEqual([[true], [false]]);
});

test('each new grade plays exactly one sound with the combo it reached', async () => {
  const sound = jest.mocked(answerSound);
  sound.mockClear();
  await render(<StudySession cards={deck} />);
  const input = screen.getByTestId('romaji-input');
  await fireEvent.changeText(input, 'a');
  await fireEvent.changeText(input, 'a');
  expect(sound.mock.calls).toEqual([[true, 1]]);
  await advanceFeedback();
  await fireEvent.changeText(input, 'wrong');
  await enter();
  await fireEvent.press(screen.getByRole('button', { name: t.next }));
  expect(sound.mock.calls).toEqual([
    [true, 1],
    [false, 0],
  ]);
});

test('finishing excludes an unfinished draft and does not commit it', async () => {
  const commit = jest.fn(async (_request: ReviewRequest) => {});
  await render(<StudySession cards={deck} onCommitReview={commit} />);
  await fireEvent.changeText(screen.getByTestId('romaji-input'), 'unfinished');
  await finishPractice();
  expect(screen.getByText('0%')).toBeOnTheScreen();
  expect(screen.getByText(t.totals(0, 0))).toBeOnTheScreen();
  expect(commit).not.toHaveBeenCalled();
});

test('a repeated character creates a fresh review and stale handlers cannot grade its next occurrence', async () => {
  const commit = jest.fn(async (_request: ReviewRequest) => {});
  await render(<StudySession cards={[deck[0]]} onCommitReview={commit} />);
  const input = screen.getByTestId('romaji-input');
  const stale = input.props.onChangeText;
  for (let index = 0; index < 8; index++) {
    await fireEvent.changeText(input, 'a');
    await advanceFeedback();
    await act(async () => stale('a'));
    expect(input).toHaveDisplayValue('');
    expect(screen.queryByText(t.completed)).not.toBeOnTheScreen();
  }
  expect(commit).toHaveBeenCalledTimes(8);
  expect(new Set(commit.mock.calls.map(([request]) => request.id)).size).toBe(
    8,
  );
  await finishPractice();
  expect(screen.getByText(t.totals(8, 0))).toBeOnTheScreen();
});

test('smart practice saves every answer and reports the level, capped for the day', async () => {
  const events: LearningEvent[] = deck.map((card) => ({
    id: `seed:${card.id}`,
    cardId: card.id,
    rating: 3,
    reviewedAt: now.toISOString(),
    deviceId: 'device',
    algorithm,
  }));
  const progress = new Map(
    deck.map((card) => [
      card.id,
      hydrateProgress(replayEvents(card.id, events).mastery),
    ]),
  );
  jest.mocked(reviews.load).mockResolvedValueOnce(progress);
  jest.mocked(reviews.commit).mockImplementation(async (request) => {
    events.push({
      id: request.id,
      cardId: request.cardId,
      rating: request.rating,
      reviewedAt: request.reviewedAt.toISOString(),
      deviceId: 'device',
      algorithm,
    });
    return replayEvents(request.cardId, events);
  });
  await render(<ScheduledStudy cards={deck} />);
  const input = await screen.findByTestId('romaji-input');
  await fireEvent.changeText(input, deck[0].reading);
  expect(await screen.findByText(t.masteryLevel('あ', 10))).toBeOnTheScreen();
  await advanceFeedback();
  for (let index = 1; index < 6; index++) {
    await fireEvent.changeText(input, deck[index % 2].reading);
    if (index === 5)
      expect(
        await screen.findByText(t.masteryCapped('い', 20)),
      ).toBeOnTheScreen();
    await advanceFeedback();
  }
  expect(reviews.commit).toHaveBeenCalledTimes(6);
  expect(progress.get(deck[0].id)?.level).toBe(20);
  expect(progress.get(deck[1].id)?.level).toBe(20);
  await fireEvent.press(screen.getByRole('button', { name: t.reveal }));
  expect(reviews.commit).toHaveBeenCalledTimes(7);
  expect(progress.get(deck[0].id)?.level).toBe(10);
  await finishPractice();
  expect(screen.getByText(t.totals(6, 1))).toBeOnTheScreen();
});

test('endless rounds keep the close action and summary but show no progress bar', async () => {
  const endless = await render(<StudySession cards={deck} />);
  expect(screen.getByTestId('close-study')).toBeOnTheScreen();
  expect(screen.getByTestId('study-summary')).toBeOnTheScreen();
  expect(screen.queryByLabelText(t.gameProgress)).not.toBeOnTheScreen();
  await endless.unmount();
  await render(<StudySession cards={deck} length={5} />);
  expect(screen.getByTestId('close-study')).toBeOnTheScreen();
  expect(screen.getByLabelText(t.gameProgress)).toBeOnTheScreen();
});

test('keyboard actions sit full-width in the bottom answer area', async () => {
  await render(<StudySession cards={deck} />);
  const area = screen.getByTestId('study-answer-area');
  expect(within(area).getByTestId('romaji-input')).toBeOnTheScreen();
  expect(within(area).getByTestId('check-answer')).toBeOnTheScreen();
  expect(within(area).getByTestId('study-action')).toHaveAccessibleName(
    t.reveal,
  );
});

test('a failed save in touch mode turns the ribbon button into Retry', async () => {
  const commit = jest
    .fn(async (_request: ReviewRequest) => {})
    .mockRejectedValueOnce(new Error('offline storage'));
  await render(
    <StudySession
      cards={[deck[0]]}
      inputMode="touch"
      onCommitReview={commit}
    />,
  );
  await fireEvent.press(screen.getByTestId('study-skip'));
  expect(await screen.findByRole('alert')).toHaveTextContent(t.reviewSaveError);
  const ribbon = screen.getByTestId('study-ribbon');
  expect(
    within(ribbon).queryByRole('button', { name: t.gameGotIt }),
  ).not.toBeOnTheScreen();
  await fireEvent.press(within(ribbon).getByTestId('study-retry'));
  expect(commit).toHaveBeenCalledTimes(2);
  expect(commit.mock.calls[1][0]).toEqual(commit.mock.calls[0][0]);
  expect(screen.getByRole('button', { name: t.gameGotIt })).toBeEnabled();
  expect(screen.queryByTestId('study-retry')).not.toBeOnTheScreen();
});

test('scheduled loading shows a card-shaped skeleton', async () => {
  jest.mocked(reviews.load).mockReturnValueOnce(new Promise(() => {}));
  await render(<ScheduledStudy cards={[deck[0]]} />);
  expect(screen.getByRole('progressbar')).toHaveAccessibleName(t.loading);
  expect(screen.getByTestId('study-skeleton-card')).toBeOnTheScreen();
});
