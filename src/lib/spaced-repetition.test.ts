import { describe, expect, test } from '@jest/globals';
import { Rating, State } from 'ts-fsrs';

import { cards } from '@/data/kana';
import {
  initializeCard,
  ratingForAnswer,
  reviewQueue,
  scheduleReview,
} from '@/lib/spaced-repetition';

const now = new Date('2026-03-08T06:55:00.000Z');

describe('FSRS scheduling', () => {
  test('initializes unseen cards and maps binary recall without guessing difficulty', () => {
    expect(initializeCard(now)).toEqual({
      due: now,
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: State.New,
      last_review: undefined,
    });
    expect(ratingForAnswer(true)).toBe(Rating.Good);
    expect(ratingForAnswer(false)).toBe(Rating.Again);
  });

  test('new-card ratings produce ordered intervals and preserve the input', () => {
    const card = initializeCard(now);
    const results = (
      [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as const
    ).map((rating) => scheduleReview(card, rating, now));
    expect(results.map(({ card }) => card.state)).toEqual([
      State.Learning,
      State.Learning,
      State.Learning,
      State.Review,
    ]);
    const due = results.map(({ card }) => card.due.getTime());
    expect(due).toEqual([...due].sort((a, b) => a - b));
    expect(new Set(due).size).toBe(4);
    for (const { card, log } of results) {
      expect(card.reps).toBe(1);
      expect(card.last_review).toEqual(now);
      expect(log.review).toEqual(now);
      expect(log.state).toBe(State.New);
    }
    expect(card.reps).toBe(0);
    expect(card.due).toEqual(now);
  });

  test('successful due reviews graduate and lengthen intervals, a lapse relearns', () => {
    let card = scheduleReview(initializeCard(now), Rating.Good, now).card;
    expect(card.learning_steps).toBe(1);
    let interval = 0;
    for (let i = 0; i < 4; i++) {
      card = scheduleReview(card, Rating.Good, card.due).card;
      expect(card.state).toBe(State.Review);
      expect(card.scheduled_days).toBeGreaterThan(interval);
      interval = card.scheduled_days;
    }
    const options = (
      [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as const
    ).map((rating) => scheduleReview(card, rating, card.due).card);
    expect(options[0].state).toBe(State.Relearning);
    expect(options[0].lapses).toBe(1);
    expect(options[0].due.getTime() - card.due.getTime()).toBe(10 * 60_000);
    expect(options[1].scheduled_days).toBeLessThan(options[2].scheduled_days);
    expect(options[2].scheduled_days).toBeLessThan(options[3].scheduled_days);
    expect(
      scheduleReview(options[0], Rating.Good, options[0].due).card.state,
    ).toBe(State.Review);
  });

  test('UTC-equivalent inputs across DST schedule the same instant', () => {
    const before = new Date('2026-03-08T01:55:00-05:00');
    const result = scheduleReview(initializeCard(before), Rating.Good, before);
    expect(result.card.due).toEqual(new Date('2026-03-08T03:05:00-04:00'));
    expect(result).toEqual(
      scheduleReview(initializeCard(now), Rating.Good, now),
    );
    expect(() => initializeCard(new Date('invalid'))).toThrow();
    expect(() =>
      scheduleReview(result.card, Rating.Good, new Date(now.getTime() - 1)),
    ).toThrow();
    expect(() =>
      scheduleReview(result.card, Rating.Manual as Rating.Good, now),
    ).toThrow();
  });
});

test('queues oldest due first, then unseen, scoped to the selection and inclusive at due time', () => {
  const reviewed = scheduleReview(initializeCard(now), Rating.Easy, now).card;
  const selected = cards.slice(0, 4);
  const progress = new Map([
    [selected[0].id, { ...reviewed, due: now }],
    [selected[2].id, { ...reviewed, due: new Date(now.getTime() - 1) }],
    [selected[3].id, reviewed],
    [cards[4].id, { ...reviewed, due: now }],
  ]);
  expect(reviewQueue(selected, progress, now)).toEqual({
    cards: [selected[2], selected[0], selected[1]],
    nextDue: reviewed.due,
  });
  expect(reviewQueue([selected[3]], progress, now)).toEqual({
    cards: [],
    nextDue: reviewed.due,
  });
  expect(reviewQueue([selected[3]], progress, reviewed.due).cards).toEqual([
    selected[3],
  ]);
});
