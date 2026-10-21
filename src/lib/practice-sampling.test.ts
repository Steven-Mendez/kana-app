import { expect, test } from '@jest/globals';
import { Rating } from 'ts-fsrs';

import { cards } from '@/data/kana';
import { nextPracticeCard, practiceWeight } from '@/lib/practice-sampling';
import {
  initializeCard,
  scheduleReview,
  shouldSchedulePractice,
} from '@/lib/spaced-repetition';
import { createRound, roundScore, studyReducer, type Grade } from '@/lib/study';

const now = new Date('2026-10-21T12:00:00Z');
const pool = cards.slice(0, 4);
const good = scheduleReview(initializeCard(now), Rating.Good, now).card;
const grade = (index: number, correct: boolean): Grade => ({
  attempt: index,
  card: pool[index],
  answer: correct ? pool[index].reading : null,
  correct,
});

test('the first prompt is randomized across the entire pool in both modes, including future-due cards', () => {
  for (const progress of [
    undefined,
    new Map(pool.map((card) => [card.id, good])),
  ]) {
    const seen = new Set(
      pool.map(
        (_, index) =>
          nextPracticeCard(
            pool,
            [],
            progress,
            now,
            () => (index + 0.5) / pool.length,
          ).id,
      ),
    );
    expect(seen).toEqual(new Set(pool.map((card) => card.id)));
  }
});

test('difficulty, elapsed time relative to stability, and due status independently raise priority', () => {
  expect(practiceWeight({ ...good, difficulty: 10 }, now)).toBeGreaterThan(
    practiceWeight({ ...good, difficulty: 1 }, now),
  );
  expect(
    practiceWeight({ ...good, last_review: new Date('2026-10-01') }, now),
  ).toBeGreaterThan(practiceWeight(good, now));
  expect(practiceWeight({ ...good, due: now }, now)).toBeGreaterThan(
    practiceWeight(good, now),
  );
  const old = { ...good, last_review: new Date('2026-10-20') };
  expect(practiceWeight({ ...old, stability: 0.5 }, now)).toBeGreaterThan(
    practiceWeight({ ...old, stability: 10 }, now),
  );
});

test('weighted sampling actually shows difficult neglected cards more often while preserving every identity', () => {
  const weak = {
    ...good,
    difficulty: 10,
    stability: 0.1,
    last_review: new Date('2026-09-01'),
    due: new Date('2026-09-02'),
  };
  const progress = new Map([
    [pool[0].id, weak],
    [pool[1].id, good],
  ]);
  const picks = Array.from(
    { length: 1000 },
    (_, index) =>
      nextPracticeCard(pool.slice(0, 2), [], progress, now, () => index / 1000)
        .id,
  );
  expect(picks.filter((id) => id === pool[0].id).length).toBeGreaterThan(700);
  expect(picks).toContain(pool[1].id);
});

test('a mistake boosts frequency until corrected; free practice remains uniform', () => {
  const progress = new Map(pool.map((card) => [card.id, good]));
  function frequency(grades: Grade[], adaptive = true) {
    return Array.from({ length: 1000 }, (_, index) =>
      nextPracticeCard(
        pool,
        grades,
        adaptive ? progress : undefined,
        now,
        () => index / 1000,
      ),
    ).filter((card) => card.id === pool[0].id).length;
  }
  const mistake = [grade(0, false), grade(1, true), grade(2, true)];
  const corrected = [
    grade(0, false),
    grade(0, true),
    grade(1, true),
    grade(2, true),
  ];
  expect(frequency(mistake)).toBeGreaterThan(frequency(corrected));
  expect(frequency(mistake, false)).toBe(frequency(corrected, false));
});

test('no adjacent repeats with alternatives; single kana keeps going and only explicit finish produces results', () => {
  for (const selection of [pool, [pool[0]]]) {
    let round = createRound([selection[0]], selection, false);
    for (let index = 0; index < 40; index++) {
      const current = round.deck[round.index];
      round = studyReducer(round, {
        type: 'input',
        cardId: current.id,
        value: current.reading,
      });
      const next = nextPracticeCard(
        selection,
        round.grades,
        undefined,
        now,
        () => (index % 7) / 7,
      );
      if (selection.length > 1) expect(next.id).not.toBe(current.id);
      round = studyReducer(round, {
        type: 'next',
        cardId: current.id,
        nextCard: next,
      });
      expect(round.finished).toBe(false);
      expect(selection).toContain(round.deck[round.index]);
    }
    round = studyReducer(round, { type: 'finish' });
    expect(round.finished).toBe(true);
    expect(round.grades).toHaveLength(40);
    expect(roundScore(round).accuracy).toBe(100);
  }
});

test('FSRS eligibility keeps new/due reviews and early failures, but skips extra successes before due', () => {
  expect(shouldSchedulePractice(undefined, Rating.Good, now)).toBe(true);
  expect(shouldSchedulePractice(initializeCard(now), Rating.Good, now)).toBe(
    true,
  );
  for (const rating of [Rating.Hard, Rating.Good, Rating.Easy] as const) {
    expect(shouldSchedulePractice(good, rating, now)).toBe(false);
    expect(shouldSchedulePractice(good, rating, good.due)).toBe(true);
  }
  expect(shouldSchedulePractice(good, Rating.Again, now)).toBe(true);
});
