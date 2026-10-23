import { expect, test } from '@jest/globals';

import { cards } from '@/data/kana';
import { reviewQueue } from '@/lib/kana-mastery';
import {
  dueStudyParams,
  filterDueSnapshot,
  summarizeProgress,
} from '@/lib/study-progress';
import { parseStudySetup } from '@/lib/study';
import { progressAfter } from '@/lib/test-progress';

const now = new Date(2026, 9, 21, 12);

test('first use has no invented activity or mastery', () => {
  const summary = summarizeProgress(new Map(), now);
  expect(summary).toMatchObject({
    reviewed: 0,
    unseen: 214,
    today: 0,
    reviews: 0,
    due: [],
    next: undefined,
  });
  expect(
    summary.alphabets.map((alphabet) => [alphabet.reviewed, alphabet.total]),
  ).toEqual([
    [0, 107],
    [0, 107],
  ]);
});

test('due uses inclusive absolute instants; today is unique answered kana on the local calendar day', () => {
  const katakana = cards.find((card) => card.alphabet === 'katakana')!;
  const yesterday = new Date(2026, 9, 20, 23, 59);
  const mastered = [1, 2, 3, 4, 5].flatMap(() => [true, true, true, true]);
  const progress = new Map([
    // Answered yesterday: due at this midnight.
    [cards[0].id, progressAfter(yesterday, true, false)],
    // Answered today: due tomorrow.
    [cards[1].id, progressAfter(new Date(2026, 9, 21, 0))],
    [
      katakana.id,
      {
        ...progressAfter(now, ...mastered),
        level: 100,
        due: new Date(now.getTime() + 1),
      },
    ],
  ]);
  const summary = summarizeProgress(progress, now);
  expect(summary).toMatchObject({
    reviewed: 3,
    unseen: 211,
    today: 2,
    reviews: 23,
    learning: 2,
    mastered: 1,
  });
  expect(summary.due.map((card) => card.id)).toEqual([cards[0].id]);
  expect(summary.next?.getTime()).toBe(now.getTime() + 1);
  expect(summary.alphabets.map((alphabet) => alphabet.reviewed)).toEqual([
    2, 1,
  ]);
});

test('due-only entry excludes unseen siblings and rechecks eligibility after a saved review', () => {
  const params = dueStudyParams([cards[0]]);
  const deck = filterDueSnapshot(parseStudySetup(params.families), params.due);
  expect(deck).toEqual([cards[0]]);
  expect(parseStudySetup(params.families).length).toBeGreaterThan(1);
  const changed = new Map([[cards[0].id, progressAfter(now)]]);
  expect(reviewQueue(deck, changed, now).cards).toEqual([]);
  expect(filterDueSnapshot(cards.slice(0, 2), '["unknown"]')).toEqual([]);
  expect(filterDueSnapshot(cards, '{')).toEqual([]);
  expect(filterDueSnapshot(cards, ['[]'])).toEqual([]);
});
