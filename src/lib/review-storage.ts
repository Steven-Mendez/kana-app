import { State, type Card, type Grade, type ReviewLog } from 'ts-fsrs';

import { cards } from '@/data/kana';
import { initializeCard, scheduleReview } from '@/lib/spaced-repetition';

export type StoredCard = Omit<Card, 'due' | 'last_review'> & {
  due: string;
  last_review: string | null;
};
export type StoredReview = Omit<ReviewLog, 'due' | 'review' | 'rating'> & {
  id: string;
  rating: Grade;
  due: string;
  review: string;
};
export type StoredProgress = {
  version: 1;
  cardId: string;
  card: StoredCard;
  reviews: StoredReview[];
};
export type ReviewRequest = {
  id: string;
  cardId: string;
  rating: Grade;
  reviewedAt: Date;
};
type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  multiRemove: (keys: string[]) => Promise<unknown>;
  removeItem: (key: string) => Promise<unknown>;
};

const resetIntentKey = 'kana-srs:reset-pending:v1';

const cardIds = new Set(cards.map((card) => card.id));

export function reviewKey(cardId: string) {
  if (!cardIds.has(cardId)) throw new Error('Unknown kana');
  return `kana-srs:v1:${cardId}`;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid review data');
  return value as Record<string, unknown>;
}

function date(value: unknown): string {
  if (typeof value !== 'string' || new Date(value).toISOString() !== value)
    throw new Error('Invalid UTC date');
  return value;
}

function number(
  value: unknown,
  max = Number.MAX_SAFE_INTEGER,
  integer = false,
) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max ||
    (integer && !Number.isSafeInteger(value))
  )
    throw new Error('Invalid review number');
  return value;
}

function memory(value: Record<string, unknown>) {
  const state = number(value.state, State.Relearning, true);
  const stability = number(value.stability, 36500);
  const difficulty = number(value.difficulty, 10);
  if (state !== State.New && (stability === 0 || difficulty < 1))
    throw new Error('Invalid memory state');
  return {
    state,
    stability,
    difficulty,
    due: date(value.due),
    elapsed_days: number(value.elapsed_days),
    scheduled_days: number(value.scheduled_days, Number.MAX_SAFE_INTEGER, true),
    learning_steps: number(value.learning_steps, Number.MAX_SAFE_INTEGER, true),
  };
}

export function parseProgress(
  raw: string | null,
  cardId: string,
): StoredProgress | null {
  reviewKey(cardId);
  if (raw === null) return null;
  const value = object(JSON.parse(raw));
  if (
    value.version !== 1 ||
    value.cardId !== cardId ||
    !Array.isArray(value.reviews)
  )
    throw new Error('Unsupported or mismatched review data');
  const c = object(value.card);
  const card: StoredCard = {
    ...memory(c),
    reps: number(c.reps, Number.MAX_SAFE_INTEGER, true),
    lapses: number(c.lapses, Number.MAX_SAFE_INTEGER, true),
    last_review: c.last_review === null ? null : date(c.last_review),
  };
  const ids = new Set<string>();
  let previous = '';
  const reviews: StoredReview[] = value.reviews.map((item: unknown) => {
    const log = object(item);
    const rating = number(log.rating, 4, true);
    const review = date(log.review);
    if (
      rating < 1 ||
      typeof log.id !== 'string' ||
      !log.id ||
      ids.has(log.id) ||
      review < previous
    )
      throw new Error('Invalid review history');
    ids.add(log.id);
    previous = review;
    return {
      ...memory(log),
      id: log.id,
      rating,
      review,
      last_elapsed_days: number(log.last_elapsed_days),
    };
  });
  if (
    card.reps !== reviews.length ||
    card.lapses > card.reps ||
    (card.state === State.New) !== (card.reps === 0) ||
    card.last_review !== (reviews.at(-1)?.review ?? null) ||
    (card.last_review !== null && card.due < card.last_review)
  )
    throw new Error('Inconsistent review history');
  return { version: 1, cardId, card, reviews };
}

export function hydrateCard(card: StoredCard): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review:
      card.last_review === null ? undefined : new Date(card.last_review),
  };
}

export function createReviewStorage(storage: Storage) {
  // shortcut: one writer per app instance; use transactional storage for concurrent tabs or large histories.
  let pending: Promise<unknown> = Promise.resolve();
  function serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = pending.then(operation);
    pending = result.catch(() => {});
    return result;
  }
  async function completeReset() {
    if ((await storage.getItem(resetIntentKey)) === null) return;
    await storage.multiRemove(cards.map((card) => reviewKey(card.id)));
    await storage.removeItem(resetIntentKey);
  }
  async function read(cardId: string) {
    return parseProgress(await storage.getItem(reviewKey(cardId)), cardId);
  }
  return {
    reset(): Promise<void> {
      return serialize(async () => {
        await storage.setItem(resetIntentKey, '1');
        await completeReset();
      });
    },
    load(cardIds: readonly string[]): Promise<Map<string, Card>> {
      return serialize(async () => {
        await completeReset();
        const records = await Promise.all([...new Set(cardIds)].map(read));
        const result = new Map<string, Card>();
        for (const saved of records) {
          if (saved) result.set(saved.cardId, hydrateCard(saved.card));
        }
        return result;
      });
    },
    commit(request: ReviewRequest): Promise<StoredProgress> {
      const { id, cardId, rating } = request;
      const now = new Date(request.reviewedAt.getTime());
      return serialize(async () => {
        await completeReset();
        if (!id.trim()) throw new Error('Missing review identity');
        const saved = await read(cardId);
        const duplicate = saved?.reviews.find((review) => review.id === id);
        if (duplicate) {
          if (
            duplicate.rating !== rating ||
            duplicate.review !== now.toISOString()
          )
            throw new Error('Review identity conflict');
          return saved!;
        }
        const current = saved ? hydrateCard(saved.card) : initializeCard(now);
        const { card, log } = scheduleReview(current, rating, now);
        const next: StoredProgress = {
          version: 1,
          cardId,
          card: {
            ...card,
            due: card.due.toISOString(),
            last_review: card.last_review?.toISOString() ?? null,
          },
          reviews: [
            ...(saved?.reviews ?? []),
            {
              ...log,
              id,
              rating,
              due: log.due.toISOString(),
              review: log.review.toISOString(),
            },
          ],
        };
        await storage.setItem(reviewKey(cardId), JSON.stringify(next));
        return next;
      });
    },
  };
}
