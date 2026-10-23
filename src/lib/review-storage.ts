import { cards } from '@/data/kana';
import {
  foldMastery,
  type Rating,
  type StoredAnswer,
  type StoredProgress,
} from '@/lib/learning-domain';

export type { StoredProgress } from '@/lib/learning-domain';
export type ReviewRequest = {
  id: string;
  cardId: string;
  rating: Rating;
  reviewedAt: Date;
};

const cardIds = new Set(cards.map((card) => card.id));

/** AsyncStorage key of a kana's progress before the learning document. */
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

/** Ordered, unique answers with valid ratings and UTC times. */
function answers(value: unknown): StoredAnswer[] {
  if (!Array.isArray(value)) throw new Error('Invalid review history');
  const ids = new Set<string>();
  let previous = '';
  return value.map((item: unknown) => {
    const log = object(item);
    const review = date(log.review);
    if (
      ![1, 2, 3, 4].includes(log.rating as number) ||
      typeof log.id !== 'string' ||
      !log.id ||
      ids.has(log.id) ||
      review < previous
    )
      throw new Error('Invalid review history');
    ids.add(log.id);
    previous = review;
    return { id: log.id, rating: log.rating as Rating, review };
  });
}

/**
 * Validates stored progress and recomputes its mastery from its answers, since
 * local days depend on the time zone of the device that derived it.
 */
export function parseProgress(
  raw: string | null,
  cardId: string,
): StoredProgress | null {
  reviewKey(cardId);
  if (raw === null) return null;
  const value = object(JSON.parse(raw));
  if (value.version !== 2 || value.cardId !== cardId)
    throw new Error('Unsupported or mismatched review data');
  object(value.mastery);
  const reviews = answers(value.reviews);
  return { version: 2, cardId, mastery: foldMastery(reviews), reviews };
}

/** Answers from a pre-document FSRS record, for the one-time migration. */
export function parseLegacyAnswers(
  raw: string | null,
  cardId: string,
): StoredAnswer[] {
  reviewKey(cardId);
  if (raw === null) return [];
  const value = object(JSON.parse(raw));
  if (value.version !== 1 || value.cardId !== cardId)
    throw new Error('Unsupported or mismatched review data');
  return answers(value.reviews);
}
