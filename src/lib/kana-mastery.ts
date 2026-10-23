import type { KanaCard } from '@/data/kana';
import {
  localDay,
  mastery,
  type Rating,
  type StoredMastery,
} from '@/lib/learning-domain';

export { mastery } from '@/lib/learning-domain';

/** A kana's saved mastery with dates ready for comparison. */
export type KanaProgress = Omit<StoredMastery, 'lastAnswer' | 'due'> & {
  lastAnswer: Date;
  due: Date;
};

export function hydrateProgress(stored: StoredMastery): KanaProgress {
  return {
    ...stored,
    lastAnswer: new Date(stored.lastAnswer),
    due: new Date(stored.due),
  };
}

export const ratingForAnswer = (correct: boolean): Rating => (correct ? 3 : 1);

export const isMastered = (progress: KanaProgress) =>
  progress.level >= mastery.max;

/** True once an unmastered kana has gained all it can today. */
export const cappedToday = (progress: KanaProgress, now: Date) =>
  !isMastered(progress) &&
  progress.day === localDay(now) &&
  progress.gainedToday >= mastery.daily;

/** Studied kana due at `now`, oldest first, and the next due time otherwise. */
export function reviewQueue(
  selected: readonly KanaCard[],
  progress: ReadonlyMap<string, KanaProgress>,
  now: Date,
): { cards: KanaCard[]; nextDue: Date | null } {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid review time');
  const due: KanaCard[] = [];
  let nextDue: Date | null = null;
  for (const card of selected) {
    const saved = progress.get(card.id);
    if (!saved) continue;
    if (saved.due.getTime() <= now.getTime()) due.push(card);
    else if (!nextDue || saved.due < nextDue) nextDue = saved.due;
  }
  due.sort(
    (a, b) =>
      progress.get(a.id)!.due.getTime() - progress.get(b.id)!.due.getTime(),
  );
  return { cards: due, nextDue };
}
