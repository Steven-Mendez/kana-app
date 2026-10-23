import { foldMastery } from '@/lib/learning-domain';
import { hydrateProgress, type KanaProgress } from '@/lib/kana-mastery';

/**
 * Mastery after answers one second apart from `at`; true is correct. With no
 * answers given, one correct answer.
 */
export function progressAfter(at: Date, ...correct: boolean[]): KanaProgress {
  return hydrateProgress(
    foldMastery(
      (correct.length ? correct : [true]).map((right, index) => ({
        rating: right ? 3 : 1,
        review: new Date(at.getTime() + index * 1000).toISOString(),
      })),
    ),
  );
}
