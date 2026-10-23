import type { KanaCard } from '@/data/kana';
import type { Grade } from '@/lib/study';

import { cappedToday, mastery, type KanaProgress } from '@/lib/kana-mastery';

// Mastery owns progress; this weight only chooses the next practice prompt.
export function practiceWeight(
  progress: KanaProgress | undefined,
  now: Date,
): number {
  if (!progress) return 3;
  const weight =
    1 + 3 * (1 - progress.level / mastery.max) + (progress.due <= now ? 1 : 0);
  return cappedToday(progress, now) ? weight / 2 : weight;
}

export function nextPracticeCard(
  pool: readonly KanaCard[],
  grades: readonly Grade[] = [],
  progress?: ReadonlyMap<string, KanaProgress>,
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
