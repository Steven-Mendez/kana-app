import { expect, jest, test } from '@jest/globals';
import { Rating } from 'ts-fsrs';

import { cards } from '@/data/kana';
import {
  createReviewStorage,
  hydrateCard,
  parseProgress,
  reviewKey,
  type ReviewRequest,
} from '@/lib/review-storage';
import { initializeCard, scheduleReview } from '@/lib/spaced-repetition';

const request: ReviewRequest = {
  id: 'first-review',
  cardId: cards[0].id,
  rating: Rating.Good,
  reviewedAt: new Date('2026-03-08T06:55:00.000Z'),
};

function memoryStorage() {
  const data = new Map<string, string>();
  const storage = {
    multiRemove: jest.fn(async (keys: string[]) => {
      for (const key of keys) data.delete(key);
    }),
    removeItem: jest.fn(async (key: string) => {
      data.delete(key);
    }),
    getItem: jest.fn(async (key: string) => data.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
  };
  return { data, storage, store: createReviewStorage(storage) };
}

test('missing progress is unseen; full FSRS logs and dates survive reopening', async () => {
  const { storage, store, data } = memoryStorage();
  expect((await store.load([request.cardId])).size).toBe(0);
  expect(storage.setItem).not.toHaveBeenCalled();
  const expected = scheduleReview(
    initializeCard(request.reviewedAt),
    request.rating,
    request.reviewedAt,
  );
  const first = await store.commit(request);
  expect(first.reviews[0]).toEqual({
    ...expected.log,
    id: request.id,
    due: expected.log.due.toISOString(),
    review: expected.log.review.toISOString(),
  });
  const second = await store.commit({
    ...request,
    id: 'second',
    reviewedAt: expected.card.due,
  });
  expect(second.reviews[1].due).toBe(request.reviewedAt.toISOString());
  expect(second.reviews[1].due).not.toBe(second.card.due);
  expect(
    parseProgress(data.get(reviewKey(request.cardId))!, request.cardId),
  ).toEqual(second);
  const loaded = await createReviewStorage(storage).load([
    request.cardId,
    request.cardId,
  ]);
  expect(loaded.get(request.cardId)).toEqual(hydrateCard(second.card));
  expect(loaded.get(request.cardId)?.last_review).toBeInstanceOf(Date);
});

test('concurrent duplicate commits and an uncertain successful write are idempotent', async () => {
  const { store, storage, data } = memoryStorage();
  storage.setItem.mockImplementationOnce(async (key, value) => {
    data.set(key, value);
    throw new Error('acknowledgement lost');
  });
  await expect(store.commit(request)).rejects.toThrow('acknowledgement lost');
  const [first, second] = await Promise.all([
    store.commit(request),
    store.commit(request),
  ]);
  expect(first).toEqual(second);
  expect(second.card.reps).toBe(1);
  expect(second.reviews).toHaveLength(1);
  expect(storage.setItem).toHaveBeenCalledTimes(1);
  await expect(
    store.commit({ ...request, rating: Rating.Again }),
  ).rejects.toThrow('identity conflict');
});

test('writes and reads are serialized; a failed write can be retried without losing history', async () => {
  const { store, storage } = memoryStorage();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  storage.setItem.mockImplementationOnce(async () => {
    await gate;
    throw new Error('disk full');
  });
  const failed = expect(store.commit(request)).rejects.toThrow('disk full');
  const retry = store.commit(request);
  const read = store.load([request.cardId]);
  await Promise.resolve();
  release();
  await failed;
  const saved = await retry;
  expect(saved.card.reps).toBe(1);
  expect((await read).get(request.cardId)).toEqual(hydrateCard(saved.card));
});

test('malformed, mismatched, unsupported, or inconsistent history is never overwritten', async () => {
  const { store, storage, data } = memoryStorage();
  const saved = await store.commit(request);
  const invalid = [
    'broken',
    'null',
    '{}',
    JSON.stringify({ ...saved, version: 2 }),
    JSON.stringify({ ...saved, cardId: cards[1].id }),
    JSON.stringify({ ...saved, card: { ...saved.card, due: '2026-03-08' } }),
    JSON.stringify({ ...saved, card: { ...saved.card, difficulty: 11 } }),
    JSON.stringify({ ...saved, card: { ...saved.card, stability: null } }),
    JSON.stringify({ ...saved, card: { ...saved.card, reps: -1 } }),
    JSON.stringify({ ...saved, card: { ...saved.card, learning_steps: 0.5 } }),
    JSON.stringify({ ...saved, card: { ...saved.card, state: 4 } }),
    JSON.stringify({ ...saved, reviews: [] }),
    JSON.stringify({ ...saved, reviews: [{ ...saved.reviews[0], rating: 0 }] }),
  ];
  storage.setItem.mockClear();
  for (const raw of invalid) {
    data.set(reviewKey(request.cardId), raw);
    await expect(store.load([request.cardId])).rejects.toThrow();
    await expect(store.commit(request)).rejects.toThrow();
    expect(data.get(reviewKey(request.cardId))).toBe(raw);
  }
  expect(storage.setItem).not.toHaveBeenCalled();
});

test('rejects unknown kana and invalid times without changing data', async () => {
  const { store, storage } = memoryStorage();
  await store.commit(request);
  storage.setItem.mockClear();
  for (const invalid of [
    { ...request, cardId: 'unknown' },
    { ...request, id: '' },
    { ...request, id: 'invalid', reviewedAt: new Date('invalid') },
    { ...request, id: 'past', reviewedAt: new Date(0) },
  ])
    await expect(store.commit(invalid)).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
});

test('intentional repeated reviews before due time keep distinct FSRS logs and survive reopening', async () => {
  const { store, storage } = memoryStorage();
  const first = await store.commit(request);
  const early = {
    ...request,
    id: 'early',
    reviewedAt: new Date(request.reviewedAt.getTime() + 500),
  };
  expect(early.reviewedAt.getTime()).toBeLessThan(
    new Date(first.card.due).getTime(),
  );
  const second = await store.commit(early);
  const expected = scheduleReview(
    hydrateCard(first.card),
    early.rating,
    early.reviewedAt,
  );
  expect(hydrateCard(second.card)).toEqual(expected.card);
  expect(second.reviews).toHaveLength(2);
  expect((await store.commit(early)).reviews).toHaveLength(2);
  expect(
    (await createReviewStorage(storage).load([request.cardId])).get(
      request.cardId,
    ),
  ).toEqual(expected.card);
});

test('reset removes both alphabets and corrupt progress while preserving unrelated data', async () => {
  const { store, data } = memoryStorage();
  await store.commit(request);
  await store.commit({
    ...request,
    cardId: cards.find((card) => card.alphabet === 'katakana')!.id,
  });
  data.set(reviewKey(cards[1].id), 'corrupt history');
  data.set('kana-study-selection', 'keep selection');
  data.set('kana-preferences', 'keep preferences');
  await store.reset();
  expect(data).toEqual(
    new Map([
      ['kana-study-selection', 'keep selection'],
      ['kana-preferences', 'keep preferences'],
    ]),
  );
  expect((await store.load(cards.map((card) => card.id))).size).toBe(0);
  await store.reset();
  const fresh = await store.commit({ ...request, id: 'fresh' });
  expect(fresh.card.reps).toBe(1);
  expect(fresh.reviews.map((review) => review.id)).toEqual(['fresh']);
});

test('reset is serialized between prior and later writes', async () => {
  const { store } = memoryStorage();
  const prior = store.commit(request);
  const reset = store.reset();
  const later = store.commit({ ...request, id: 'after-reset' });
  await Promise.all([prior, reset]);
  expect((await later).reviews.map((review) => review.id)).toEqual([
    'after-reset',
  ]);
});

test('a partially failed deletion is completed before loading after restart', async () => {
  const { store, storage, data } = memoryStorage();
  await store.commit(request);
  await store.commit({ ...request, cardId: cards[1].id });
  storage.multiRemove.mockImplementationOnce(async (keys) => {
    data.delete(keys[0]);
    throw new Error('interrupted');
  });
  await expect(store.reset()).rejects.toThrow('interrupted');
  expect(data.has(reviewKey(cards[1].id))).toBe(true);
  const reopened = createReviewStorage(storage);
  expect((await reopened.load(cards.map((card) => card.id))).size).toBe(0);
  expect(data.size).toBe(0);
});

test('failed intent creation does not delete data; a failed intent cleanup is retried before a new commit', async () => {
  const { store, storage, data } = memoryStorage();
  await store.commit(request);
  storage.setItem.mockRejectedValueOnce(new Error('disk full'));
  await expect(store.reset()).rejects.toThrow('disk full');
  expect(storage.multiRemove).not.toHaveBeenCalled();
  expect((await store.load([request.cardId])).get(request.cardId)?.reps).toBe(
    1,
  );
  storage.removeItem.mockRejectedValueOnce(new Error('interrupted cleanup'));
  await expect(store.reset()).rejects.toThrow('interrupted cleanup');
  const reopened = createReviewStorage(storage);
  const fresh = await reopened.commit({ ...request, id: 'new-epoch' });
  expect(fresh.reviews.map((review) => review.id)).toEqual(['new-epoch']);
  expect(data.size).toBe(1);
});
