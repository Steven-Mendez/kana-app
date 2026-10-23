import { cards } from '@/data/kana';
import type { DocumentStore } from '@/lib/document-store';
import {
  algorithm,
  legacyAlgorithm,
  mergeEvents,
  replayEvents,
  validatePatch,
  type LearningEvent,
  type SettingsOperation,
  type SettingsPatch,
} from '@/lib/learning-domain';
import {
  defaultPreferences,
  parsePreferences,
  preferencesKey,
  type Preferences,
} from '@/lib/preferences-storage';
import { hydrateProgress } from '@/lib/kana-mastery';
import {
  parseLegacyAnswers,
  parseProgress,
  reviewKey,
  type ReviewRequest,
  type StoredProgress,
} from '@/lib/review-storage';
import {
  defaultSelection,
  parseSelection,
  selectionKey,
  type Selection,
} from '@/lib/selection-storage';

export type LearningDocument = {
  version: 2;
  generation: number;
  resetRequestId: string | null;
  deviceId: string;
  preferences: Preferences;
  selection: Selection;
  events: LearningEvent[];
  progress: Record<string, StoredProgress>;
  pending: string[];
  operations: SettingsOperation[];
  guestDecision: string | null;
  hasSettings: boolean;
};
export type RemoteSnapshot = {
  generation: number;
  resetRequired?: boolean;
  acknowledgedReset?: string;
  revision: number;
  revisions: Record<string, number>;
  progress: Record<string, StoredProgress>;
  events: LearningEvent[];
  preferences: Preferences;
  selection: Selection;
  hasSettings: boolean;
  acknowledged: string[];
  acknowledgedOperations: string[];
};
const validIds = new Set(cards.map((card) => card.id));
function empty(deviceId: string): LearningDocument {
  return {
    version: 2,
    generation: 0,
    resetRequestId: null,
    deviceId,
    preferences: { ...defaultPreferences },
    selection: { ...defaultSelection, kanaIds: [...defaultSelection.kanaIds] },
    events: [],
    progress: {},
    pending: [],
    operations: [],
    guestDecision: null,
    hasSettings: false,
  };
}
function parse(raw: string | null, deviceId: string): LearningDocument {
  if (!raw) return empty(deviceId);
  const doc: LearningDocument = JSON.parse(raw);
  // Additive upgrade for documents saved before account reset was introduced.
  doc.generation ??= 0;
  doc.resetRequestId ??= null;
  if (
    doc.version !== 2 ||
    !Number.isSafeInteger(doc.generation) ||
    doc.generation < 0 ||
    (doc.resetRequestId !== null && typeof doc.resetRequestId !== 'string') ||
    typeof doc.deviceId !== 'string' ||
    !doc.deviceId ||
    !Array.isArray(doc.events) ||
    !Array.isArray(doc.pending) ||
    !Array.isArray(doc.operations) ||
    typeof doc.hasSettings !== 'boolean' ||
    (doc.guestDecision !== null && typeof doc.guestDecision !== 'string') ||
    !doc.progress ||
    typeof doc.progress !== 'object'
  )
    throw new Error('Invalid learning document');
  doc.preferences = parsePreferences(JSON.stringify(doc.preferences));
  doc.selection = parseSelection(JSON.stringify(doc.selection));
  if (mergeEvents(doc.events).length !== doc.events.length)
    throw new Error('Duplicate stored events');
  // Progress derived by an earlier model (FSRS) is rebuilt from its events.
  if (
    Object.values(doc.progress).some(
      (progress) => (progress as { version: number }).version === 1,
    )
  )
    rebuild(doc);
  const byId = new Map(doc.events.map((event) => [event.id, event]));
  if (
    Object.values(doc.progress).reduce(
      (sum, progress) => sum + progress.reviews.length,
      0,
    ) !== doc.events.length
  )
    throw new Error('Inconsistent stored history');
  for (const progress of Object.values(doc.progress)) {
    for (const log of progress.reviews) {
      const event = byId.get(log.id);
      if (
        !event ||
        event.cardId !== progress.cardId ||
        event.reviewedAt !== log.review ||
        event.rating !== log.rating
      )
        throw new Error('Inconsistent stored event');
    }
  }
  if (
    doc.events.some((event) => !validIds.has(event.cardId)) ||
    doc.pending.some((id) => !byId.has(id))
  )
    throw new Error('Invalid pending events');
  for (const [id, progress] of Object.entries(doc.progress))
    doc.progress[id] = parseProgress(JSON.stringify(progress), id)!;
  for (const op of doc.operations) {
    if (!op.id) throw new Error('Invalid operation');
    validatePatch(op.patch, validIds);
  }
  return doc;
}
function rebuild(doc: LearningDocument) {
  doc.events = mergeEvents(doc.events);
  doc.progress = Object.fromEntries(
    [...new Set(doc.events.map((event) => event.cardId))].map((id) => [
      id,
      replayEvents(id, doc.events),
    ]),
  );
}
function applyPatch(doc: LearningDocument, patch: SettingsPatch) {
  validatePatch(patch, validIds);
  if (patch.theme) doc.preferences.theme = patch.theme;
  if (patch.language) doc.preferences.language = patch.language;
  if (patch.alphabet) doc.selection.alphabet = patch.alphabet;
  const selected = new Set(doc.selection.kanaIds);
  for (const [id, value] of Object.entries(patch.selection ?? {})) {
    if (value) selected.add(id);
    else selected.delete(id);
  }
  doc.selection.kanaIds = [...selected];
}
export function guestFingerprint(doc: LearningDocument) {
  return JSON.stringify([
    doc.events.map((event) => event.id).sort(),
    doc.preferences,
    [...doc.selection.kanaIds].sort(),
    doc.selection.alphabet,
  ]);
}

export function createLearningRepository(
  db: DocumentStore,
  uuid: () => string,
  legacy: { getItem(key: string): Promise<string | null> },
) {
  const listeners = new Set<(account: string) => void>();
  let device: Promise<string> | undefined;
  function deviceId() {
    device ??= db
      .update('device', (raw) => ({ raw: raw ?? uuid(), result: raw ?? '' }))
      .then(async (value) => value || (await db.read('device'))!)
      .catch((error) => {
        device = undefined;
        throw error;
      });
    return device;
  }
  async function update<T>(
    account: string,
    change: (doc: LearningDocument) => T,
  ): Promise<T> {
    const id = await deviceId();
    const result = await db.update(`account:${account}`, (raw) => {
      const doc = parse(raw, id);
      const result = change(doc);
      return { raw: JSON.stringify(doc), result };
    });
    listeners.forEach((listener) => listener(account));
    return result;
  }
  async function read(account: string) {
    return parse(await db.read(`account:${account}`), await deviceId());
  }
  return {
    read,
    subscribe(listener: (account: string) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async requestReset(account: string, requestId?: string) {
      if (account !== 'guest') {
        return update(account, (doc) => {
          doc.resetRequestId ??= requestId ?? uuid();
        });
      }
      const id = await deviceId();
      // Explicit reset can discard malformed review data without touching settings.
      await db.update('account:guest', (raw) => {
        const prior = raw ? JSON.parse(raw) : empty(id);
        if (prior.version !== 2) throw new Error('Invalid learning document');
        const doc = empty(id);
        doc.preferences = parsePreferences(JSON.stringify(prior.preferences));
        doc.selection = parseSelection(JSON.stringify(prior.selection));
        doc.hasSettings = prior.hasSettings === true;
        doc.generation =
          (Number.isSafeInteger(prior.generation) && prior.generation >= 0
            ? prior.generation
            : 0) + 1;
        return { raw: JSON.stringify(doc), result: undefined };
      });
      listeners.forEach((listener) => listener(account));
    },
    async migrate() {
      if (await db.read('account:guest')) return;
      const id = await deviceId();
      const doc = empty(id);
      const resetPending = await legacy.getItem('kana-srs:reset-pending:v1');
      const [preferences, selection, records] = await Promise.all([
        legacy.getItem(preferencesKey),
        legacy.getItem(selectionKey),
        resetPending !== null
          ? Promise.resolve([])
          : Promise.all(
              cards.map(async (card) => ({
                cardId: card.id,
                reviews: parseLegacyAnswers(
                  await legacy.getItem(reviewKey(card.id)),
                  card.id,
                ),
              })),
            ),
      ]);
      doc.preferences = parsePreferences(preferences);
      doc.selection = parseSelection(selection);
      doc.events = records.flatMap((record) =>
        record.reviews.map((review) => ({
          id: `legacy:${id}:${review.id}`,
          cardId: record.cardId,
          rating: review.rating,
          reviewedAt: review.review,
          deviceId: id,
          algorithm: legacyAlgorithm,
        })),
      );
      rebuild(doc);
      await db.update('account:guest', (raw) => ({
        raw: raw ?? JSON.stringify(doc),
        result: undefined,
      }));
    },
    reviews(account: string) {
      return {
        async load(ids: readonly string[]) {
          const doc = await read(account);
          if (doc.resetRequestId) throw new Error('Progress reset is pending');
          return new Map(
            ids.flatMap((id) =>
              doc.progress[id]
                ? [[id, hydrateProgress(doc.progress[id].mastery)] as const]
                : [],
            ),
          );
        },
        commit(request: ReviewRequest) {
          return update(account, (doc) => {
            if (doc.resetRequestId)
              throw new Error('Progress reset is pending');
            if (!validIds.has(request.cardId)) throw new Error('Unknown kana');
            const event: LearningEvent = {
              id: request.id,
              cardId: request.cardId,
              rating: request.rating,
              reviewedAt: request.reviewedAt.toISOString(),
              deviceId: doc.deviceId,
              algorithm,
            };
            const existing = doc.events.find((item) => item.id === event.id);
            if (existing) {
              mergeEvents([existing, event]);
              return doc.progress[event.cardId];
            }
            const previous = doc.progress[event.cardId];
            if (
              previous?.mastery.lastAnswer &&
              previous.mastery.lastAnswer > event.reviewedAt
            )
              throw new Error('Review precedes last review');
            doc.events = mergeEvents(doc.events, [event]);
            doc.progress[event.cardId] = replayEvents(event.cardId, doc.events);
            if (account !== 'guest') doc.pending.push(event.id);
            return doc.progress[event.cardId];
          });
        },
      };
    },
    settings(account: string, patch: SettingsPatch) {
      const id = uuid();
      return update(account, (doc) => {
        applyPatch(doc, patch);
        doc.hasSettings = true;
        if (account !== 'guest') doc.operations.push({ id, patch });
      });
    },
    async decideImport(account: string, accept: boolean) {
      if (account === 'guest') throw new Error('Account required');
      const guest = await read('guest');
      const fingerprint = guestFingerprint(guest);
      return update(account, (doc) => {
        if (doc.guestDecision === fingerprint) return;
        if (accept) {
          const known = new Set(doc.events.map((event) => event.id));
          doc.events = mergeEvents(doc.events, guest.events);
          doc.pending.push(
            ...guest.events
              .filter((event) => !known.has(event.id))
              .map((event) => event.id),
          );
          if (!doc.hasSettings) {
            const patch: SettingsPatch = {
              ...guest.preferences,
              alphabet: guest.selection.alphabet,
              selection: Object.fromEntries(
                cards.map((card) => [
                  card.id,
                  guest.selection.kanaIds.includes(card.id),
                ]),
              ),
            };
            applyPatch(doc, patch);
            doc.operations.push({ id: uuid(), patch, onlyIfEmpty: true });
            doc.hasSettings = true;
          }
          rebuild(doc);
        }
        doc.guestDecision = fingerprint;
      });
    },
    applyRemote(account: string, snapshot: RemoteSnapshot) {
      return update(account, (doc) => {
        if (
          !Number.isSafeInteger(snapshot.generation) ||
          snapshot.generation < 0
        )
          throw new Error('Invalid remote generation');
        if (snapshot.generation < doc.generation) return;
        if (snapshot.generation > doc.generation) {
          doc.generation = snapshot.generation;
          doc.events = [];
          doc.progress = {};
          doc.pending = [];
        }
        if (snapshot.acknowledgedReset === doc.resetRequestId)
          doc.resetRequestId = null;
        parsePreferences(JSON.stringify(snapshot.preferences));
        parseSelection(JSON.stringify(snapshot.selection));
        if (snapshot.events.some((event) => !validIds.has(event.cardId)))
          throw new Error('Unknown remote kana');
        // The server's progress is a cache; local progress is rebuilt below.
        doc.pending = doc.pending.filter(
          (id) => !snapshot.acknowledged.includes(id),
        );
        doc.events = mergeEvents(
          snapshot.events,
          doc.events.filter((event) => doc.pending.includes(event.id)),
        );
        doc.operations = doc.operations.filter(
          (op) => !snapshot.acknowledgedOperations.includes(op.id),
        );
        doc.preferences = { ...snapshot.preferences };
        doc.selection = {
          ...snapshot.selection,
          kanaIds: [...snapshot.selection.kanaIds],
        };
        doc.hasSettings = snapshot.hasSettings;
        for (const op of doc.operations) {
          if (!op.onlyIfEmpty || !doc.hasSettings) {
            applyPatch(doc, op.patch);
            doc.hasSettings = true;
          }
        }
        rebuild(doc);
      });
    },
  };
}
export type LearningRepository = ReturnType<typeof createLearningRepository>;
