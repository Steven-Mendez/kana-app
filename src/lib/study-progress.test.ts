import { expect, test } from '@jest/globals';
import { State, type Card } from 'ts-fsrs';

import { cards } from '@/data/kana';
import { initializeCard, reviewQueue } from '@/lib/spaced-repetition';
import {
  dueStudyParams,
  filterDueSnapshot,
  summarizeProgress,
} from '@/lib/study-progress';
import { parseStudySetup } from '@/lib/study';

const now = new Date(2026, 9, 21, 12);
function saved(overrides: Partial<Card> = {}): Card {
  return {
    ...initializeCard(now),
    reps: 2,
    state: State.Review,
    last_review: new Date(2026, 9, 20, 23, 59),
    ...overrides,
  };
}

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

test('due uses inclusive absolute instants; today is unique reviewed kana on the local calendar day', () => {
  const katakana = cards.find((card) => card.alphabet === 'katakana')!;
  const progress = new Map([
    [
      cards[0].id,
      saved({
        due: new Date(now.getTime() - 1),
        state: State.Learning,
        last_review: new Date(2026, 9, 21, 0),
      }),
    ],
    [cards[1].id, saved({ due: now, state: State.Relearning })],
    [
      katakana.id,
      saved({ due: new Date(now.getTime() + 1), last_review: now, reps: 4 }),
    ],
    [cards[2].id, initializeCard(now)],
  ]);
  const summary = summarizeProgress(progress, now);
  expect(summary).toMatchObject({
    reviewed: 3,
    unseen: 211,
    today: 2,
    reviews: 8,
    learning: 1,
    relearning: 1,
    scheduled: 1,
  });
  expect(summary.due.map((card) => card.id)).toEqual([
    cards[0].id,
    cards[1].id,
  ]);
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
  const changed = new Map([
    [cards[0].id, saved({ due: new Date(now.getTime() + 1000) })],
  ]);
  expect(reviewQueue(deck, changed, now).cards).toEqual([]);
  expect(filterDueSnapshot(cards.slice(0, 2), '["unknown"]')).toEqual([]);
  expect(filterDueSnapshot(cards, '{')).toEqual([]);
  expect(filterDueSnapshot(cards, ['[]'])).toEqual([]);
});
