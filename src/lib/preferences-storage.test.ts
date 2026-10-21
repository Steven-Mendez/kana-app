import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import {
  createPreferencesStorage,
  defaultPreferences,
  parsePreferences,
  preferencesKey,
} from '@/lib/preferences-storage';

test('only supported preferences hydrate; malformed values fall back without writes', async () => {
  assert.deepEqual(parsePreferences('{"theme":"dark","language":"en"}'), {
    theme: 'dark',
    language: 'en',
  });
  assert.equal(parsePreferences(null), defaultPreferences);
  for (const raw of [
    'oops',
    'null',
    '{}',
    '{"theme":"system","language":"en"}',
    '{"theme":"dark","language":"fr"}',
  ]) {
    assert.throws(() => parsePreferences(raw));
    const store = createPreferencesStorage({
      async getItem() {
        return raw;
      },
      async setItem() {
        assert.fail('hydration wrote defaults');
      },
    });
    assert.deepEqual(await store.load(), {
      preferences: defaultPreferences,
      failed: true,
    });
  }
});

test('preference writes are ordered and recover after failure before reload', async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let raw: string | null = null;
  let attempts = 0;
  const store = createPreferencesStorage({
    async getItem() {
      return raw;
    },
    async setItem(key, value) {
      assert.equal(key, preferencesKey);
      attempts++;
      if (attempts === 1) {
        await gate;
        throw new Error('full');
      }
      raw = value;
    },
  });
  const failed = assert.rejects(store.save(defaultPreferences));
  const latest = { theme: 'dark' as const, language: 'en' as const };
  const saved = store.save(latest);
  const loaded = store.load();
  await Promise.resolve();
  assert.equal(attempts, 1);
  release();
  await Promise.all([failed, saved]);
  assert.deepEqual(await loaded, { preferences: latest, failed: false });
});
