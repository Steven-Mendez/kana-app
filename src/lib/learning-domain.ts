// Shared by the app and the Edge Function. Changing this requires a migration.
export const algorithm = 'mastery-v1';
/** History saved by the former FSRS scheduler, replayed as plain answers. */
export const legacyAlgorithm = 'fsrs-5.4.2-r90-v1';
export type Rating = 1 | 2 | 3 | 4;
export type LearningEvent = {
  id: string;
  cardId: string;
  rating: Rating;
  reviewedAt: string;
  deviceId: string;
  algorithm: string;
};
export type SettingsPatch = {
  theme?: 'light' | 'dark';
  language?: 'es' | 'en';
  alphabet?: 'hiragana' | 'katakana';
  selection?: Record<string, boolean>;
};
export type SettingsOperation = {
  id: string;
  patch: SettingsPatch;
  onlyIfEmpty?: boolean;
};

export function validateEvent(event: LearningEvent) {
  if (
    !event ||
    typeof event.id !== 'string' ||
    !event.id ||
    event.id.length > 200 ||
    typeof event.cardId !== 'string' ||
    typeof event.deviceId !== 'string' ||
    !event.deviceId ||
    event.deviceId.length > 100 ||
    (event.algorithm !== algorithm && event.algorithm !== legacyAlgorithm) ||
    ![1, 2, 3, 4].includes(event.rating) ||
    typeof event.reviewedAt !== 'string' ||
    !Number.isFinite(Date.parse(event.reviewedAt)) ||
    new Date(event.reviewedAt).toISOString() !== event.reviewedAt
  )
    throw new Error('Invalid review event');
}

export function mergeEvents(...groups: LearningEvent[][]): LearningEvent[] {
  const events = new Map<string, LearningEvent>();
  for (const event of groups.flat()) {
    validateEvent(event);
    const previous = events.get(event.id);
    if (
      previous &&
      (previous.cardId !== event.cardId ||
        previous.rating !== event.rating ||
        previous.reviewedAt !== event.reviewedAt ||
        previous.deviceId !== event.deviceId ||
        previous.algorithm !== event.algorithm)
    )
      throw new Error('Review identity conflict');
    events.set(event.id, event);
  }
  return [...events.values()].sort((a, b) =>
    a.reviewedAt < b.reviewedAt
      ? -1
      : a.reviewedAt > b.reviewedAt
        ? 1
        : a.id < b.id
          ? -1
          : a.id > b.id
            ? 1
            : 0,
  );
}

export const mastery = {
  /** Points a correct answer adds, within the daily allowance. */
  gain: 5,
  /** Points a mistake removes. */
  loss: 10,
  /** Most points one kana can gain in a local day. */
  daily: 20,
  max: 100,
  /** Days a mastered kana waits before it is due again. */
  reviewDays: 14,
} as const;

export type StoredMastery = {
  level: number;
  answers: number;
  correct: number;
  /** Points gained on `day`, the local day of the last answer. */
  gainedToday: number;
  day: string;
  lastAnswer: string;
  due: string;
};
export type StoredAnswer = { id: string; rating: Rating; review: string };
export type StoredProgress = {
  version: 2;
  cardId: string;
  mastery: StoredMastery;
  reviews: StoredAnswer[];
};

/** Local calendar day of the replaying device, e.g. `2026-10-23`. */
export function localDay(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Folds a kana's answers, oldest first, into its mastery. */
export function foldMastery(
  answers: readonly { rating: Rating; review: string }[],
): StoredMastery {
  if (!answers.length) throw new Error('Mastery requires an answer');
  let level = 0;
  let correct = 0;
  let gainedToday = 0;
  let day = '';
  for (const answer of answers) {
    const today = localDay(new Date(answer.review));
    if (today !== day) {
      day = today;
      gainedToday = 0;
    }
    if (answer.rating === 1) {
      level = Math.max(0, level - mastery.loss);
      continue;
    }
    correct += 1;
    const gain = Math.min(
      mastery.gain,
      mastery.daily - gainedToday,
      mastery.max - level,
    );
    level += gain;
    gainedToday += gain;
  }
  const last = new Date(answers[answers.length - 1].review);
  const due =
    level >= mastery.max
      ? new Date(last.getTime() + mastery.reviewDays * 86_400_000)
      : new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
  return {
    level,
    answers: answers.length,
    correct,
    gainedToday,
    day,
    lastAnswer: last.toISOString(),
    due: due.toISOString(),
  };
}

export function replayEvents(
  cardId: string,
  input: LearningEvent[],
): StoredProgress {
  const reviews = mergeEvents(input)
    .filter((event) => event.cardId === cardId)
    .map((event) => ({
      id: event.id,
      rating: event.rating,
      review: event.reviewedAt,
    }));
  return { version: 2, cardId, mastery: foldMastery(reviews), reviews };
}

export function validatePatch(
  patch: SettingsPatch,
  validIds: ReadonlySet<string>,
) {
  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch) ||
    Object.keys(patch).some(
      (key) => !['theme', 'language', 'alphabet', 'selection'].includes(key),
    ) ||
    (patch.theme !== undefined && !['light', 'dark'].includes(patch.theme)) ||
    (patch.language !== undefined && !['es', 'en'].includes(patch.language)) ||
    (patch.alphabet !== undefined &&
      !['hiragana', 'katakana'].includes(patch.alphabet)) ||
    (patch.selection !== undefined &&
      (typeof patch.selection !== 'object' ||
        patch.selection === null ||
        Array.isArray(patch.selection) ||
        Object.entries(patch.selection).some(
          ([key, value]) => !validIds.has(key) || typeof value !== 'boolean',
        )))
  )
    throw new Error('Invalid settings');
}
