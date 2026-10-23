import { expect, test } from '@jest/globals';

import { replayEvents, type LearningEvent } from '@/lib/learning-domain';
import {
  parseLegacyAnswers,
  parseProgress,
  reviewKey,
} from '@/lib/review-storage';

const event = (id: string, rating: 1 | 3, second: number): LearningEvent => ({
  id,
  cardId: 'hiragana:あ',
  rating,
  reviewedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, second)).toISOString(),
  deviceId: 'device',
  algorithm: 'mastery-v1',
});

test('stored progress round-trips and its mastery is recomputed from its answers', () => {
  const stored = replayEvents('hiragana:あ', [
    event('one', 3, 0),
    event('two', 1, 1),
    event('three', 3, 2),
  ]);
  expect(parseProgress(JSON.stringify(stored), 'hiragana:あ')).toEqual(stored);
  const stale = { ...stored, mastery: { ...stored.mastery, level: 99 } };
  expect(
    parseProgress(JSON.stringify(stale), 'hiragana:あ')?.mastery.level,
  ).toBe(5);
  expect(parseProgress(null, 'hiragana:あ')).toBeNull();
});

test('malformed, mismatched, unsupported or unordered history is rejected', () => {
  const stored = replayEvents('hiragana:あ', [event('one', 3, 0)]);
  const reject = (value: unknown, cardId = 'hiragana:あ') =>
    expect(() => parseProgress(JSON.stringify(value), cardId)).toThrow();
  reject(stored, 'hiragana:い');
  reject({ ...stored, version: 1 });
  reject({ ...stored, mastery: null });
  reject({ ...stored, reviews: [] });
  reject({ ...stored, reviews: [{ ...stored.reviews[0], rating: 5 }] });
  reject({ ...stored, reviews: [{ ...stored.reviews[0], review: 'today' }] });
  reject({ ...stored, reviews: [stored.reviews[0], stored.reviews[0]] });
  reject({
    ...stored,
    reviews: [
      { ...stored.reviews[0], id: 'late', review: '2026-01-02T00:00:00.000Z' },
      stored.reviews[0],
    ],
  });
  expect(() => parseProgress('{', 'hiragana:あ')).toThrow();
  expect(() => reviewKey('hiragana:x')).toThrow('Unknown kana');
});

test('legacy FSRS records yield their answers for the one-time migration', () => {
  const legacy = {
    version: 1,
    cardId: 'hiragana:あ',
    card: { state: 2 },
    reviews: [
      {
        id: 'old',
        rating: 3,
        review: '2026-01-01T00:00:00.000Z',
        stability: 2,
      },
    ],
  };
  expect(parseLegacyAnswers(JSON.stringify(legacy), 'hiragana:あ')).toEqual([
    { id: 'old', rating: 3, review: '2026-01-01T00:00:00.000Z' },
  ]);
  expect(parseLegacyAnswers(null, 'hiragana:あ')).toEqual([]);
  expect(() =>
    parseLegacyAnswers(
      JSON.stringify({ ...legacy, version: 2 }),
      'hiragana:あ',
    ),
  ).toThrow();
});
