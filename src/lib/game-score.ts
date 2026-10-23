import type { Grade } from '@/lib/study';

export type RoundGrade = 'S' | 'A' | 'B' | 'C';

/** Finite round lengths: a regular round and a duel. */
export const roundLength = 12;
export const duelLength = 8;

const comboMultiplier = (combo: number) =>
  combo >= 6 ? 2 : combo >= 3 ? 1.5 : 1;

/** Points, combo and arcade grade, derived only from the round's immutable grades. */
export function gameScore(grades: readonly Grade[]) {
  let combo = 0;
  let bestCombo = 0;
  let points = 0;
  let correct = 0;
  let revealed = false;
  for (const grade of grades) {
    if (grade.correct) {
      combo += 1;
      correct += 1;
      points += 10 * comboMultiplier(combo);
    } else {
      combo = 0;
      if (grade.answer === null) revealed = true;
    }
    bestCombo = Math.max(bestCombo, combo);
  }
  const accuracy = grades.length
    ? Math.round((correct / grades.length) * 100)
    : 0;
  const grade: RoundGrade | null = !grades.length
    ? null
    : accuracy >= 95 && !revealed
      ? 'S'
      : accuracy >= 85
        ? 'A'
        : accuracy >= 70
          ? 'B'
          : 'C';
  return { points: Math.round(points), combo, bestCombo, accuracy, grade };
}

/** `2:41` style duration. */
export function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
