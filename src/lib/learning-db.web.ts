import type { DocumentStore } from '@/lib/document-store';

export function createIndexedDbStore(name = 'kana-learning'): DocumentStore {
  let database: Promise<IDBDatabase> | undefined;
  function open() {
    database ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('documents');
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error('Close older Kana tabs and retry'));
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          database = undefined;
        };
        resolve(request.result);
      };
    }).catch((error) => {
      database = undefined;
      throw error;
    });
    return database;
  }
  return {
    async read(key) {
      const db = await open();
      return new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction('documents', 'readonly');
        const request = tx.objectStore('documents').get(key);
        tx.oncomplete = () => resolve(request.result ?? null);
        tx.onabort = () => reject(tx.error);
      });
    },
    async update<T>(
      key: string,
      change: (raw: string | null) => { raw: string; result: T },
    ) {
      const db = await open();
      return new Promise<T>((resolve, reject) => {
        const tx = db.transaction('documents', 'readwrite');
        const store = tx.objectStore('documents');
        const request = store.get(key);
        let result: T;
        let failure: unknown;
        request.onsuccess = () => {
          try {
            const next = change(request.result ?? null);
            result = next.result;
            store.put(next.raw, key);
          } catch (error) {
            failure = error;
            tx.abort();
          }
        };
        tx.oncomplete = () => resolve(result);
        tx.onabort = () =>
          reject(
            failure ?? tx.error ?? new Error('Storage transaction failed'),
          );
      });
    },
  };
}

export const learningDb = createIndexedDbStore();
