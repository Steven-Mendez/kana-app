import { expect, test } from '@jest/globals';
import { IDBFactory } from 'fake-indexeddb';

import { createIndexedDbStore } from '@/lib/learning-db.web';
import {
  algorithm,
  mergeEvents,
  replayEvents,
  type LearningEvent,
} from '@/lib/learning-domain';
import {
  createLearningRepository,
  type RemoteSnapshot,
} from '@/lib/learning-repository';
import { createLearningSync } from '@/lib/learning-sync';
import { defaultPreferences } from '@/lib/preferences-storage';
import { defaultSelection } from '@/lib/selection-storage';

function setup(legacy: Record<string, string> = {}) {
  globalThis.indexedDB = new IDBFactory();
  let sequence = 0;
  const db = createIndexedDbStore();
  const repo = createLearningRepository(db, () => `uuid-${++sequence}`, {
    getItem: async (key) => legacy[key] ?? null,
  });
  return { repo, db };
}
const first: LearningEvent = {
  id: 'one',
  cardId: 'hiragana:あ',
  rating: 3,
  reviewedAt: '2026-01-01T00:00:00.000Z',
  deviceId: 'a',
  algorithm,
};
function snapshot(
  events: LearningEvent[] = [],
  acknowledged: string[] = [],
): RemoteSnapshot {
  return {
    generation: 0,
    revision: 0,
    revisions: {},
    progress: Object.fromEntries(
      [...new Set(events.map((event) => event.cardId))].map((id) => [
        id,
        replayEvents(id, events),
      ]),
    ),
    events,
    acknowledged,
    acknowledgedOperations: [],
    preferences: { ...defaultPreferences },
    selection: { ...defaultSelection },
    hasSettings: false,
  };
}

test('IndexedDB transactions serialize concurrent writers and abort without partial writes', async () => {
  const { db } = setup();
  await Promise.all(
    Array.from({ length: 20 }, () =>
      db.update('counter', (raw) => ({
        raw: String(Number(raw) + 1),
        result: null,
      })),
    ),
  );
  expect(await db.read('counter')).toBe('20');
  await expect(
    db.update('counter', () => {
      throw new Error('abort');
    }),
  ).rejects.toThrow('abort');
  expect(await db.read('counter')).toBe('20');
});

test('a durable review and pending event survive reopening and remain isolated by account', async () => {
  const { repo, db } = setup();
  await repo.migrate();
  const request = {
    id: first.id,
    cardId: first.cardId,
    rating: first.rating,
    reviewedAt: new Date(first.reviewedAt),
  };
  await repo.reviews('alice').commit(request);
  await repo.reviews('alice').commit(request);
  const reopened = createLearningRepository(db, () => 'other', {
    getItem: async () => null,
  });
  expect((await reopened.read('alice')).pending).toEqual(['one']);
  expect((await reopened.read('alice')).progress[first.cardId].card.reps).toBe(
    1,
  );
  expect((await reopened.read('bob')).events).toEqual([]);
  await expect(
    repo.reviews('alice').commit({ ...request, rating: 1 }),
  ).rejects.toThrow('conflict');
});

test('offline events arriving out of order converge, including same-time and newly early reviews', () => {
  const second = { ...first, id: 'two', deviceId: 'b', rating: 1 as const };
  expect(replayEvents(first.cardId, [second, first])).toEqual(
    replayEvents(first.cardId, [first, second, first]),
  );
  expect(replayEvents(first.cardId, [first, second]).card.reps).toBe(2);
  expect(() => mergeEvents([first, { ...first, rating: 1 }])).toThrow(
    'conflict',
  );
});

test('migration retains legacy data, rejects corruption, and can resume', async () => {
  const legacy = { 'kana-srs:v1:hiragana:あ': 'broken' };
  const { repo, db } = setup(legacy);
  await expect(repo.migrate()).rejects.toThrow();
  expect(await db.read('account:guest')).toBeNull();
  legacy['kana-srs:v1:hiragana:あ'] = JSON.stringify(
    replayEvents(first.cardId, [first]),
  );
  await repo.migrate();
  await repo.migrate();
  expect((await repo.read('guest')).events).toHaveLength(1);
  expect(legacy['kana-srs:v1:hiragana:あ']).toContain('one');
});

test('guest import requires a choice, is idempotent, and respects existing settings', async () => {
  const { repo } = setup();
  await repo.migrate();
  await repo.reviews('guest').commit({
    id: 'guest-event',
    cardId: first.cardId,
    rating: 3,
    reviewedAt: new Date(first.reviewedAt),
  });
  await repo.settings('guest', { theme: 'dark' });
  await repo.decideImport('declined', false);
  expect((await repo.read('declined')).events).toHaveLength(0);
  expect((await repo.read('guest')).events).toHaveLength(1);
  await repo.decideImport('new', true);
  await repo.decideImport('new', true);
  const imported = await repo.read('new');
  expect(imported.pending).toEqual(['guest-event']);
  expect(imported.preferences.theme).toBe('dark');
  expect(imported.operations).toHaveLength(1);
  await repo.applyRemote('existing', { ...snapshot(), hasSettings: true });
  await repo.decideImport('existing', true);
  expect((await repo.read('existing')).preferences.theme).toBe('light');
  expect((await repo.read('existing')).operations).toEqual([]);
});

test('lost acknowledgements retain pending reviews and an idempotent retry completes', async () => {
  const { repo } = setup();
  await repo.reviews('alice').commit({
    id: first.id,
    cardId: first.cardId,
    rating: 3,
    reviewedAt: new Date(first.reviewedAt),
  });
  let stored: LearningEvent[] = [];
  let fail = true;
  const sync = createLearningSync(repo, 'alice', async ({ events }) => {
    stored = mergeEvents(stored, events);
    if (fail) {
      fail = false;
      throw new Error('connection lost');
    }
    return snapshot(
      stored,
      events.map((event) => event.id),
    );
  });
  await expect(sync()).rejects.toThrow('connection lost');
  expect((await repo.read('alice')).pending).toEqual(['one']);
  await sync();
  expect(stored).toHaveLength(1);
  expect((await repo.read('alice')).pending).toEqual([]);
});

test('new writes during a request survive its response and synchronize in the next batch', async () => {
  const { repo } = setup();
  await repo.settings('alice', { theme: 'dark' });
  let calls = 0;
  const sync = createLearningSync(repo, 'alice', async ({ operations }) => {
    if (calls++ === 0) await repo.settings('alice', { language: 'en' });
    return {
      ...snapshot(),
      preferences: { theme: 'dark', language: calls === 1 ? 'es' : 'en' },
      hasSettings: true,
      acknowledgedOperations: operations.map((op) => op.id),
    };
  });
  await sync();
  expect(calls).toBe(2);
  expect((await repo.read('alice')).preferences).toEqual({
    theme: 'dark',
    language: 'en',
  });
  expect((await repo.read('alice')).operations).toEqual([]);
});

test('early failures persist and queue exactly once during continuous practice', async () => {
  const { repo } = setup();
  await repo.reviews('alice').commit({
    id: 'initial',
    cardId: first.cardId,
    rating: 3,
    reviewedAt: new Date(first.reviewedAt),
  });
  const failure = {
    id: 'early-failure',
    cardId: first.cardId,
    rating: 1 as const,
    reviewedAt: new Date('2026-01-01T00:00:01.000Z'),
  };
  expect(
    (await repo.read('alice')).progress[first.cardId].card.due >
      failure.reviewedAt.toISOString(),
  ).toBe(true);
  await repo.reviews('alice').commit(failure);
  await repo.reviews('alice').commit(failure);
  const doc = await repo.read('alice');
  expect(doc.pending).toEqual(['initial', 'early-failure']);
  expect(doc.progress[first.cardId].card.reps).toBe(2);
});

test('migration honors an interrupted legacy reset without resurrecting old reviews', async () => {
  const legacy = {
    'kana-srs:reset-pending:v1': '1',
    'kana-srs:v1:hiragana:あ': 'corrupt-old-review',
    'kana-preferences': JSON.stringify({ theme: 'dark', language: 'en' }),
  };
  const { repo } = setup(legacy);
  await repo.migrate();
  expect((await repo.read('guest')).events).toEqual([]);
  expect((await repo.read('guest')).preferences.theme).toBe('dark');
  expect(legacy['kana-srs:v1:hiragana:あ']).toBe('corrupt-old-review');
});

test('guest reset is atomic and preserves settings and other account documents', async () => {
  const { repo } = setup();
  await repo.settings('guest', { theme: 'dark' });
  const request = {
    id: first.id,
    cardId: first.cardId,
    rating: first.rating,
    reviewedAt: new Date(first.reviewedAt),
  };
  await repo.reviews('guest').commit(request);
  await repo.reviews('alice').commit(request);
  await repo.requestReset('guest');
  const guest = await repo.read('guest');
  expect(guest.events).toEqual([]);
  expect(guest.progress).toEqual({});
  expect(guest.preferences.theme).toBe('dark');
  expect(guest.selection).toEqual(defaultSelection);
  expect((await repo.read('alice')).pending).toEqual([first.id]);
});

test('account reset intent survives failure and reopening, blocking old reviews until acknowledged', async () => {
  const { repo, db } = setup();
  const request = {
    id: first.id,
    cardId: first.cardId,
    rating: first.rating,
    reviewedAt: new Date(first.reviewedAt),
  };
  await repo.reviews('alice').commit(request);
  await repo.requestReset('alice');
  const resetId = (await repo.read('alice')).resetRequestId;
  const sync = createLearningSync(repo, 'alice', async () => {
    throw new Error('offline');
  });
  await expect(sync()).rejects.toThrow('offline');
  const reopened = createLearningRepository(db, () => 'different-id', {
    getItem: async () => null,
  });
  await reopened.requestReset('alice');
  expect((await reopened.read('alice')).resetRequestId).toBe(resetId);
  await expect(reopened.reviews('alice').commit(request)).rejects.toThrow(
    'reset',
  );
  await createLearningSync(reopened, 'alice', async (payload) => {
    expect(payload.resetId).toBe(resetId);
    return {
      ...snapshot(),
      generation: 1,
      resetRequired: true,
      acknowledgedReset: resetId!,
    };
  })();
  const fresh = await reopened.read('alice');
  expect(fresh.resetRequestId).toBeNull();
  expect(fresh.events).toEqual([]);
  expect(fresh.pending).toEqual([]);
  expect(fresh.generation).toBe(1);
});

test('remote reset discards old pending reviews and ignores late responses from the previous generation', async () => {
  const { repo } = setup();
  await repo.reviews('alice').commit({
    id: first.id,
    cardId: first.cardId,
    rating: first.rating,
    reviewedAt: new Date(first.reviewedAt),
  });
  await createLearningSync(repo, 'alice', async (payload) => {
    expect(payload.generation).toBe(0);
    return { ...snapshot(), generation: 1, resetRequired: true };
  })();
  await repo.applyRemote('alice', snapshot([first], [first.id]));
  expect((await repo.read('alice')).events).toEqual([]);
  expect((await repo.read('alice')).pending).toEqual([]);
  expect((await repo.read('alice')).generation).toBe(1);
});

test('manual reset retry can reuse an intent already acknowledged by background sync', async () => {
  const { repo } = setup();
  const resetId = 'confirmed-reset';
  await repo.requestReset('alice', resetId);
  await repo.applyRemote('alice', {
    ...snapshot(),
    generation: 1,
    acknowledgedReset: resetId,
  });
  await repo.reviews('alice').commit({
    ...first,
    reviewedAt: new Date(first.reviewedAt),
  });
  await repo.requestReset('alice', resetId);
  const saved = (await repo.read('alice')).events;
  await createLearningSync(repo, 'alice', async (payload) => {
    if (payload.resetId) expect(payload.resetId).toBe(resetId);
    return {
      ...snapshot(saved, [first.id]),
      generation: 1,
      resetRequired: true,
      acknowledgedReset: resetId,
    };
  })();
  expect((await repo.read('alice')).events).toEqual(saved);
  expect((await repo.read('alice')).resetRequestId).toBeNull();
});

test('explicit guest reset discards corrupt reviews without replacing preferences', async () => {
  const { repo, db } = setup();
  await repo.settings('guest', { theme: 'dark' });
  await db.update('account:guest', (raw) => ({
    raw: JSON.stringify({ ...JSON.parse(raw!), progress: { broken: true } }),
    result: undefined,
  }));
  await expect(repo.read('guest')).rejects.toThrow();
  await repo.requestReset('guest');
  expect((await repo.read('guest')).progress).toEqual({});
  expect((await repo.read('guest')).preferences.theme).toBe('dark');
});
