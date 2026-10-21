import { createEmptyCard, fsrs, type Grade } from 'ts-fsrs';

// Shared by the app and the Edge Function. Changing this requires a migration.
export const algorithm = 'fsrs-5.4.2-r90-v1';
export type LearningEvent = {
  id: string;
  cardId: string;
  rating: Grade;
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
    event.algorithm !== algorithm ||
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

export function replayEvents(cardId: string, input: LearningEvent[]) {
  const events = mergeEvents(input).filter((event) => event.cardId === cardId);
  const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });
  let card = createEmptyCard(
    events.length ? new Date(events[0].reviewedAt) : new Date(0),
  );
  const reviews = events.map((event) => {
    // Eligibility is enforced when studying. Offline merges may legitimately be early.
    const result = scheduler.next(
      card,
      new Date(event.reviewedAt),
      event.rating,
    );
    card = result.card;
    return {
      ...result.log,
      id: event.id,
      rating: event.rating,
      due: result.log.due.toISOString(),
      review: result.log.review.toISOString(),
    };
  });
  return {
    version: 1 as const,
    cardId,
    card: {
      ...card,
      due: card.due.toISOString(),
      last_review: card.last_review?.toISOString() ?? null,
    },
    reviews,
  };
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
