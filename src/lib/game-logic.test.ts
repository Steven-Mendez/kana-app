import { beforeEach, expect, test } from '@jest/globals';

import { cards } from '@/data/kana';
import {
  addConfusion,
  confusedCard,
  confusedWith,
  createConfusionStore,
  parseConfusions,
  topConfusion,
} from '@/lib/confusions';
import { boardRows, boardTile } from '@/lib/game-board';
import { coinChoices } from '@/lib/game-choices';
import { formatDuration, gameScore } from '@/lib/game-score';
import { dailyStreak, extendedToday, isMilestone } from '@/lib/game-streak';
import type { Grade } from '@/lib/study';
import { resetTestStore, testStore } from '@/lib/test-document-store';
import { progressAfter } from '@/lib/test-progress';

const kana = (glyph: string) => cards.find((card) => card.kana === glyph)!;
const grade = (correct: boolean, answer: string | null = 'x'): Grade => ({
  attempt: 0,
  card: kana('あ'),
  answer,
  correct,
});

beforeEach(() => resetTestStore());

test('points grow with the combo and the grade follows accuracy', () => {
  const grades = [true, true, true, true, false, true, true].map((ok) =>
    grade(ok),
  );
  expect(gameScore(grades)).toEqual({
    points: 70,
    combo: 2,
    bestCombo: 4,
    accuracy: 86,
    grade: 'A',
  });
  expect(gameScore(Array.from({ length: 6 }, () => grade(true))).points).toBe(
    10 + 10 + 15 + 15 + 15 + 20,
  );
  expect(gameScore([]).grade).toBeNull();
  expect(gameScore([grade(true)]).grade).toBe('S');
  // A revealed answer rules out S even at high accuracy.
  const revealed = [
    ...Array.from({ length: 20 }, () => grade(true)),
    grade(false, null),
  ];
  expect(gameScore(revealed).grade).toBe('A');
  expect(gameScore([grade(true), grade(false), grade(false)]).grade).toBe('C');
  expect(formatDuration(161_000)).toBe('2:41');
});

test('the daily streak counts consecutive local days with saved reviews', () => {
  const now = new Date(2026, 9, 22, 18);
  const day = (offset: number) => ({
    reviewedAt: new Date(2026, 9, 22 - offset, 9).toISOString(),
  });
  expect(dailyStreak([], now)).toEqual({ days: 0, state: 'off' });
  expect(dailyStreak([day(1), day(2), day(3), day(4)], now)).toEqual({
    days: 4,
    state: 'at-risk',
  });
  const extended = dailyStreak([day(0), day(1), day(2), day(3)], now);
  expect(extended).toEqual({ days: 4, state: 'active' });
  expect(dailyStreak([day(0), day(2)], now)).toEqual({
    days: 1,
    state: 'active',
  });
  expect(dailyStreak([day(2)], now)).toEqual({ days: 0, state: 'off' });
  expect(
    extendedToday(dailyStreak([day(1), day(2), day(3)], now), extended),
  ).toBe(true);
  expect(isMilestone(7)).toBe(true);
  expect(isMilestone(8)).toBe(false);
});

test('board tiles reflect mastery and keep gojūon gaps', () => {
  const now = new Date();
  const learning = { ...progressAfter(now), level: 45 };
  expect(boardTile(kana('う')).state).toBe('unseen');
  expect(boardTile(kana('い'), learning)).toMatchObject({
    state: 'learning',
    strength: 0.45,
  });
  expect(boardTile(kana('え'), progressAfter(now, false))).toMatchObject({
    state: 'learning',
    strength: 0,
  });
  expect(boardTile(kana('あ'), { ...learning, level: 100 }).state).toBe(
    'mastered',
  );
  const rows = boardRows('hiragana', new Map());
  expect(rows).toHaveLength(11);
  expect(rows[7].slots.map(({ tile }) => tile?.card.kana ?? null)).toEqual([
    'や',
    null,
    'ゆ',
    null,
    'よ',
  ]);
  expect(rows[9].slots.map(({ tile }) => tile?.card.kana ?? null)).toEqual([
    'わ',
    null,
    null,
    null,
    'を',
  ]);
});

test('coins hold the answer and two distinct readings, confusions and round kana first', () => {
  for (let run = 0; run < 50; run++) {
    const coins = coinChoices(kana('つ'));
    expect(coins).toHaveLength(3);
    expect(new Set(coins).size).toBe(3);
    expect(coins).toContain('tsu');
  }
  const seeded = coinChoices(
    kana('つ'),
    [kana('し').id, kana('そ').id],
    [],
    () => 0.3,
  );
  expect(seeded.sort()).toEqual(['shi', 'so', 'tsu']);
  // Kana of the same round come next, before any confusion is recorded.
  for (let run = 0; run < 20; run++)
    expect(
      coinChoices(kana('い'), [], [kana('い').id, kana('か').id]),
    ).toContain('ka');
  expect(
    coinChoices(
      kana('つ'),
      [kana('し').id],
      [kana('つ').id, kana('ぬ').id],
    ).sort(),
  ).toEqual(['nu', 'shi', 'tsu']);
  // Equal readings never appear twice: じ and ぢ both read ji.
  expect(
    coinChoices(kana('じ'), [kana('ぢ').id]).filter((coin) => coin === 'ji'),
  ).toHaveLength(1);
});

test('only answers that spell another kana of the same alphabet are confusions', () => {
  expect(confusedCard(kana('つ'), 'shi')?.kana).toBe('し');
  expect(confusedCard(kana('つ'), 'si')?.kana).toBe('し');
  expect(confusedCard(kana('つ'), 'xyz')).toBeNull();
  expect(confusedCard(kana('つ'), null)).toBeNull();
  expect(confusedCard(kana('つ'), 'tsu')).toBeNull();
  expect(confusedCard(kana('ツ'), 'shi')?.kana).toBe('シ');
});

test('the top pair needs two confusions and the latest wins ties', () => {
  let doc = parseConfusions(null, 0);
  const [tsu, shi, nu, me] = ['つ', 'し', 'ぬ', 'め'].map(
    (glyph) => kana(glyph).id,
  );
  doc = addConfusion(doc, tsu, shi, new Date(1));
  expect(topConfusion(doc)).toBeNull();
  doc = addConfusion(doc, shi, tsu, new Date(2));
  doc = addConfusion(doc, nu, me, new Date(3));
  doc = addConfusion(doc, me, nu, new Date(4));
  expect(topConfusion(doc)?.cards.map((card) => card.kana)).toEqual([
    'ぬ',
    'め',
  ]);
  expect(topConfusion(doc)?.count).toBe(2);
  expect(confusedWith(doc, tsu)).toEqual([shi]);
});

test('the confusion store keeps accounts apart and resets with the generation', async () => {
  const store = createConfusionStore(testStore);
  const [tsu, shi] = ['つ', 'し'].map((glyph) => kana(glyph).id);
  await store.record('guest', 0, tsu, shi);
  await store.record('guest', 0, shi, tsu);
  expect(topConfusion(await store.read('guest', 0))?.count).toBe(2);
  expect(topConfusion(await store.read('someone', 0))).toBeNull();
  expect(topConfusion(await store.read('guest', 1))).toBeNull();
  await store.record('guest', 1, tsu, shi);
  expect((await store.read('guest', 1)).pairs).toEqual({
    [[tsu, shi].sort().join('|')]: expect.objectContaining({ count: 1 }),
  });
  expect(parseConfusions('not json', 0).pairs).toEqual({});
});
