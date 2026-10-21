import type { DocumentStore } from '@/lib/document-store';

const records = new Map<string, string>();
export const testStore: DocumentStore = {
  async read(key) {
    return records.get(key) ?? null;
  },
  async update(key, change) {
    const next = change(records.get(key) ?? null);
    records.set(key, next.raw);
    return next.result;
  },
};
export function resetTestStore() {
  records.clear();
}
