import assert from 'node:assert/strict';
import { test } from '@jest/globals';
import { selectedCards } from '@/lib/study';

import {
  createSelectionStorage,
  defaultSelection,
  parseSelection,
  selectionKey,
} from '@/lib/selection-storage';

test('preferences preserve empty selections, clean stale IDs and reject malformed data', () => {
  assert.equal(parseSelection(null), defaultSelection);
  assert.deepEqual(parseSelection('{"alphabet":"katakana","familyIds":[]}'), {
    alphabet: 'katakana',
    kanaIds: [],
  });
  assert.deepEqual(
    parseSelection(
      '{"alphabet":"hiragana","familyIds":["hiragana:a","gone","hiragana:a"]}',
    ).kanaIds,
    selectedCards(['hiragana:a']).map((card) => card.id),
  );
  for (const raw of [
    'oops',
    'null',
    '{}',
    '{"alphabet":"other","familyIds":[]}',
    '{"alphabet":"hiragana","familyIds":[1]}',
  ])
    assert.throws(() => parseSelection(raw));
});

test('reading never writes defaults and read failures provide a usable fallback', async () => {
  let writes = 0;
  const store = createSelectionStorage({
    async getItem(key) {
      assert.equal(key, selectionKey);
      return '{"alphabet":"katakana","familyIds":["katakana:n"]}';
    },
    async setItem() {
      writes++;
    },
  });
  assert.deepEqual((await store.load()).selection, {
    alphabet: 'katakana',
    kanaIds: ['katakana:ン'],
  });
  assert.equal(writes, 0);
  for (const getItem of [
    async () => {
      throw new Error('unavailable');
    },
    async () => 'broken',
  ]) {
    const result = await createSelectionStorage({
      getItem,
      async setItem() {},
    }).load();
    assert.equal(result.selection, defaultSelection);
    assert.ok(result.notice);
  }
});

test('writes stay ordered, a rejected save recovers, and reopening waits for the latest write', async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let raw: string | null = null;
  let attempts = 0;
  const store = createSelectionStorage({
    async getItem() {
      return raw;
    },
    async setItem(key, value) {
      assert.equal(key, selectionKey);
      attempts++;
      if (attempts === 1) {
        await gate;
        throw new Error('full');
      }
      raw = value;
    },
  });
  const failed = assert.rejects(store.save(defaultSelection));
  const latest = { alphabet: 'katakana' as const, kanaIds: [] };
  const saved = store.save(latest);
  const restored = store.load();
  await Promise.resolve();
  assert.equal(attempts, 1);
  release();
  await Promise.all([failed, saved]);
  assert.deepEqual((await restored).selection, latest);
});

test('individual preferences retain partial families and distinguish equal readings', () => {
  const ids = ['hiragana:い', 'hiragana:じ', 'hiragana:ぢ', 'katakana:キュ'];
  assert.deepEqual(
    parseSelection(
      JSON.stringify({
        alphabet: 'katakana',
        kanaIds: [...ids, ids[0], 'gone'],
      }),
    ).kanaIds,
    ids,
  );
  assert.deepEqual(
    parseSelection(
      JSON.stringify({
        alphabet: 'hiragana',
        kanaIds: [],
        familyIds: ['hiragana:a'],
      }),
    ).kanaIds,
    [],
  );
  assert.throws(() => parseSelection('{"alphabet":"hiragana","kanaIds":[1]}'));
});
