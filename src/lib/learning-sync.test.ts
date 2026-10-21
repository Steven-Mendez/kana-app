import { afterEach, expect, jest, test } from '@jest/globals';

import { createLearningRepository } from '@/lib/learning-repository';
import { startSyncLoop } from '@/lib/learning-sync';
import { resetTestStore, testStore } from '@/lib/test-document-store';

afterEach(() => {
  jest.useRealTimers();
});

test('sync retries with backoff, pauses in background and stops on disposal', async () => {
  jest.useFakeTimers();
  resetTestStore();
  const repository = createLearningRepository(testStore, () => 'device', {
    getItem: async () => null,
  });
  const synchronize = jest
    .fn<() => Promise<void>>()
    .mockRejectedValueOnce(new Error('offline'))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(undefined);
  const onStatus = jest.fn();
  const loop = startSyncLoop({
    repository,
    account: 'alice',
    synchronize,
    foreground: true,
    onStatus,
    onSynced: jest.fn(),
  });
  await jest.advanceTimersByTimeAsync(0);
  expect(onStatus).toHaveBeenLastCalledWith('attention');
  await jest.advanceTimersByTimeAsync(1999);
  expect(synchronize).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(1);
  expect(synchronize).toHaveBeenCalledTimes(2);
  loop.setForeground(false);
  await jest.advanceTimersByTimeAsync(60_000);
  expect(synchronize).toHaveBeenCalledTimes(2);
  loop.setForeground(true);
  await jest.advanceTimersByTimeAsync(0);
  expect(onStatus).toHaveBeenLastCalledWith('synced');
  loop.dispose();
  await repository.settings('alice', { theme: 'dark' });
  await jest.advanceTimersByTimeAsync(60_000);
  expect(synchronize).toHaveBeenCalledTimes(3);
});

test('an old account loop cannot publish status after it is disposed', async () => {
  resetTestStore();
  const repository = createLearningRepository(testStore, () => 'device', {
    getItem: async () => null,
  });
  let resolve!: () => void;
  const pending = new Promise<void>((done) => {
    resolve = done;
  });
  const onSynced = jest.fn();
  const onStatus = jest.fn();
  const loop = startSyncLoop({
    repository,
    account: 'alice',
    synchronize: () => pending,
    foreground: true,
    onStatus,
    onSynced,
  });
  loop.dispose();
  resolve();
  await pending;
  await Promise.resolve();
  expect(onSynced).not.toHaveBeenCalled();
  expect(onStatus).toHaveBeenCalledTimes(1);
});
