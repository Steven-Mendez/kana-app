import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { KanaStrokes } from '@/components/kana-strokes';
import { strokeGlyphs } from '@/lib/kana-strokes';
import { cards } from '@/data/kana';
import { copy } from '@/lib/copy';

jest.mock('@/components/icon', () => ({ Icon: () => null }));
jest.mock('uniwind', () => ({
  useCSSVariable: (names: string[]) => names.map(() => '#806a67'),
}));
jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
  }),
}));

const t = copy.en;

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// SVG labels render as TSpan content, which text queries do not reach.
const numbers = () =>
  [...JSON.stringify(screen.toJSON()).matchAll(/"content":"(\d+)"/g)].map(
    ([, value]) => Number(value),
  );

// Each stroke schedules the next after rendering, so advance one at a time.
async function step(count: number) {
  for (let index = 0; index < count; index++)
    await act(async () => jest.advanceTimersByTime(550));
}

test('every catalogue kana has bundled stroke data', () => {
  const missing = cards.filter((card) => !strokeGlyphs(card.kana));
  expect(missing.map((card) => card.kana)).toEqual([]);
});

test('strokes appear in order and replay restarts from the first', async () => {
  await render(<KanaStrokes kana="あ" size={96} />);
  expect(screen.getByLabelText(`あ. ${t.strokeOrder(3)}`)).toBeOnTheScreen();
  expect(numbers()).toEqual([]);
  await step(1);
  expect(numbers()).toEqual([1]);
  await step(2);
  expect(numbers()).toEqual([1, 2, 3]);
  await fireEvent.press(screen.getByRole('button', { name: t.replayStrokes }));
  expect(numbers()).toEqual([]);
});

test('yōon numbering continues across both glyphs', async () => {
  const [ki, ya] = strokeGlyphs('きゃ')!;
  const total = ki.strokes.length + ya.strokes.length;
  await render(<KanaStrokes kana="きゃ" size={64} />);
  expect(
    screen.getByLabelText(`きゃ. ${t.strokeOrder(total)}`),
  ).toBeOnTheScreen();
  await step(total);
  expect(numbers()).toEqual(
    Array.from({ length: total }, (_, index) => index + 1),
  );
});

test('reduced motion shows the finished diagram at once', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  await render(<KanaStrokes kana="い" size={96} />);
  await act(async () => {});
  expect(numbers()).toEqual([1, 2]);
});
