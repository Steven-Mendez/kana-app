import type { Card } from 'ts-fsrs';

import type { KanaCard } from '@/data/kana';
import type { Grade } from '@/lib/study';

import { recallProbability } from '@/lib/spaced-repetition';

// FSRS owns memory state; this weight only chooses the next practice prompt.
export function practiceWeight(card: Card | undefined, now: Date): number {
  if (!card || card.reps === 0) return 3;
  return (
    1 +
    card.difficulty / 5 +
    4 * (1 - recallProbability(card, now)) +
    (card.due <= now ? 1 : 0)
  );
}

export function nextPracticeCard(
  pool: readonly KanaCard[],
  grades: readonly Grade[] = [],
  progress?: ReadonlyMap<string, Card>,
  now = new Date(),
  random = Math.random,
): KanaCard {
  if (!pool.length) throw new Error('Practice requires at least one kana');
  const previous = grades.at(-1)?.card.id;
  const candidates =
    pool.length > 1 ? pool.filter((card) => card.id !== previous) : pool;
  const latest = new Map<string, boolean>();
  for (const grade of grades) latest.set(grade.card.id, grade.correct);
  const weights = candidates.map((card) => {
    if (!progress) return 1;
    const mistake = latest.get(card.id) === false ? 3 : 1;
    const recent = grades.at(-2)?.card.id === card.id ? 0.5 : 1;
    return practiceWeight(progress.get(card.id), now) * mistake * recent;
  });
  let draw = random() * weights.reduce((total, weight) => total + weight, 0);
  for (const [index, card] of candidates.entries()) {
    draw -= weights[index];
    if (draw < 0) return card;
  }
  return candidates[candidates.length - 1];
}
