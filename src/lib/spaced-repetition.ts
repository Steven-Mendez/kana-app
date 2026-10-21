import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';

import type { KanaCard } from '@/data/kana';

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });

function validateTime(now: Date) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid review time');
}

export function initializeCard(now: Date): Card {
  validateTime(now);
  return createEmptyCard(now);
}

export function ratingForAnswer(correct: boolean): Grade {
  return correct ? Rating.Good : Rating.Again;
}

export function scheduleReview(card: Card, rating: Grade, now: Date) {
  validateTime(now);
  if (card.last_review && now.getTime() < card.last_review.getTime())
    throw new Error('Review time precedes the last review');
  if (![Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].includes(rating))
    throw new Error('Invalid review rating');
  return scheduler.next(card, now, rating);
}

export function reviewQueue(
  selected: readonly KanaCard[],
  progress: ReadonlyMap<string, Card>,
  now: Date,
): { cards: KanaCard[]; nextDue: Date | null } {
  validateTime(now);
  const due: KanaCard[] = [];
  const unseen: KanaCard[] = [];
  let nextDue: Date | null = null;
  for (const card of selected) {
    const saved = progress.get(card.id);
    if (!saved || saved.reps === 0) unseen.push(card);
    else if (saved.due.getTime() <= now.getTime()) due.push(card);
    else if (!nextDue || saved.due < nextDue) nextDue = saved.due;
  }
  due.sort(
    (a, b) =>
      progress.get(a.id)!.due.getTime() - progress.get(b.id)!.due.getTime(),
  );
  return { cards: [...due, ...unseen], nextDue };
}
