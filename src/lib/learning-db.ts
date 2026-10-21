import { openDatabaseAsync } from 'expo-sqlite';

import type { DocumentStore } from '@/lib/document-store';

let database: ReturnType<typeof openDatabaseAsync> | undefined;
function open() {
  database ??= openDatabaseAsync('kana-learning.db')
    .then(async (db) => {
      await db.execAsync(
        'PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);',
      );
      return db;
    })
    .catch((error) => {
      database = undefined;
      throw error;
    });
  return database;
}
let pending: Promise<unknown> = Promise.resolve();
export const learningDb: DocumentStore = {
  async read(key) {
    const db = await open();
    return (
      (
        await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM documents WHERE id = ?',
          key,
        )
      )?.value ?? null
    );
  },
  update<T>(
    key: string,
    change: (raw: string | null) => { raw: string; result: T },
  ) {
    const operation = pending.then(async () => {
      const db = await open();
      let result!: T;
      await db.withExclusiveTransactionAsync(async (tx) => {
        const row = await tx.getFirstAsync<{ value: string }>(
          'SELECT value FROM documents WHERE id = ?',
          key,
        );
        const next = change(row?.value ?? null);
        await tx.runAsync(
          'INSERT INTO documents (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value',
          key,
          next.raw,
        );
        result = next.result;
      });
      return result;
    });
    pending = operation.catch(() => {});
    return operation;
  },
};
