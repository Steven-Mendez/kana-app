import { expect, test } from '@jest/globals';

import { cards } from '@/data/kana';
import { foldMastery, localDay, replayEvents } from '@/lib/learning-domain';
import {
  cappedToday,
  hydrateProgress,
  isMastered,
  ratingForAnswer,
  reviewQueue,
} from '@/lib/kana-mastery';
import { progressAfter } from '@/lib/test-progress';

const day = (date: number, hour = 12) => new Date(2026, 9, date, hour);
const answers = (...days: [Date, boolean][]) =>
  days.map(([at, right], index) => ({
    rating: right ? (3 as const) : (1 as const),
    review: new Date(at.getTime() + index * 1000).toISOString(),
  }));

test('answers map to Good and Again', () => {
  expect(ratingForAnswer(true)).toBe(3);
  expect(ratingForAnswer(false)).toBe(1);
});

test('drilling one day stops at the daily allowance and grows again tomorrow', () => {
  const today = progressAfter(day(1), ...Array(10).fill(true));
  expect(today).toMatchObject({ level: 20, answers: 10, correct: 10 });
  expect(cappedToday(today, day(1, 20))).toBe(true);
  expect(cappedToday(today, day(2))).toBe(false);
  expect(today.due).toEqual(new Date(2026, 9, 2));
  const tomorrow = foldMastery(
    answers(...Array(10).fill([day(1), true]), [day(2), true]),
  );
  expect(tomorrow.level).toBe(25);
});

test('five days of practice master a kana, due again in fourteen days', () => {
  const log = answers(
    ...[1, 2, 3, 4, 5].flatMap((date) =>
      Array(4).fill([day(date), true] as [Date, boolean]),
    ),
  );
  const mastered = hydrateProgress(foldMastery(log));
  expect(mastered.level).toBe(100);
  expect(isMastered(mastered)).toBe(true);
  expect(cappedToday(mastered, day(5))).toBe(false);
  expect(mastered.due.getTime() - mastered.lastAnswer.getTime()).toBe(
    14 * 86_400_000,
  );
});

test('mistakes cost ten points, never below zero, and do not refund the allowance', () => {
  expect(progressAfter(day(1), false).level).toBe(0);
  const slip = progressAfter(day(1), true, true, true, true, false, true);
  expect(slip).toMatchObject({ level: 10, gainedToday: 20, correct: 5 });
  const log = answers(
    ...[1, 2, 3, 4, 5].flatMap((date) =>
      Array(4).fill([day(date), true] as [Date, boolean]),
    ),
    [day(20), false],
  );
  const lapsed = hydrateProgress(foldMastery(log));
  expect(lapsed.level).toBe(90);
  expect(isMastered(lapsed)).toBe(false);
  expect(lapsed.due).toEqual(new Date(2026, 9, 21));
});

test('legacy FSRS ratings replay as answers and history order does not matter', () => {
  const event = (id: string, rating: 1 | 2 | 3 | 4, second: number) => ({
    id,
    cardId: 'hiragana:あ',
    rating,
    reviewedAt: new Date(day(1).getTime() + second * 1000).toISOString(),
    deviceId: 'a',
    algorithm: 'fsrs-5.4.2-r90-v1',
  });
  const log = [event('c', 4, 2), event('a', 2, 0), event('b', 1, 1)];
  const progress = replayEvents('hiragana:あ', log);
  expect(progress.reviews.map((review) => review.id)).toEqual(['a', 'b', 'c']);
  expect(progress.mastery).toMatchObject({ level: 5, correct: 2, answers: 3 });
  expect(replayEvents('hiragana:あ', [...log].reverse())).toEqual(progress);
});

test('local days follow the calendar, not UTC', () => {
  expect(localDay(new Date(2026, 0, 2, 0, 30))).toBe('2026-01-02');
  expect(localDay(new Date(2026, 0, 1, 23, 30))).toBe('2026-01-01');
});

test('the review queue holds due studied kana, oldest first, scoped to the selection', () => {
  const [a, i, u, e] = cards;
  const progress = new Map([
    [a.id, progressAfter(day(3))],
    [i.id, progressAfter(day(1))],
    [u.id, progressAfter(day(5))],
  ]);
  expect(reviewQueue([a, i, u, e], progress, day(5))).toEqual({
    cards: [i, a],
    nextDue: new Date(2026, 9, 6),
  });
  expect(reviewQueue([u, e], progress, day(5))).toEqual({
    cards: [],
    nextDue: new Date(2026, 9, 6),
  });
  expect(() => reviewQueue([a], progress, new Date(Number.NaN))).toThrow();
});
