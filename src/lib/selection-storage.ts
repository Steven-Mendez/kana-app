import type { Alphabet } from '@/data/kana';
import { selectedCards, validFamilyIds, validKanaIds } from '@/lib/study';

export type Selection = { alphabet: Alphabet; kanaIds: string[] };
export const defaultSelection: Selection = {
  alphabet: 'hiragana',
  kanaIds: selectedCards(['hiragana:a']).map((card) => card.id),
};
export const selectionKey = 'kana-study-selection';

export function parseSelection(raw: string | null): Selection {
  if (raw === null) return defaultSelection;
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== 'object' ||
    !('alphabet' in value) ||
    (value.alphabet !== 'hiragana' && value.alphabet !== 'katakana')
  )
    throw new Error('Invalid selection preferences');
  // An explicit character selection, including [], wins over legacy families.
  const individual = 'kanaIds' in value;
  const ids = individual
    ? value.kanaIds
    : 'familyIds' in value
      ? value.familyIds
      : null;
  if (
    !Array.isArray(ids) ||
    !ids.every((id: unknown) => typeof id === 'string')
  )
    throw new Error('Invalid selection identities');
  return {
    alphabet: value.alphabet,
    kanaIds: individual
      ? validKanaIds(ids)
      : selectedCards(validFamilyIds(ids)).map((card) => card.id),
  };
}

type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
};

export function createSelectionStorage(storage: Storage) {
  let pending: Promise<unknown> = Promise.resolve();
  return {
    async load() {
      await pending;
      try {
        return {
          selection: parseSelection(await storage.getItem(selectionKey)),
          notice: '' as const,
        };
      } catch {
        return {
          selection: defaultSelection,
          notice: 'selectionLoadError' as const,
        };
      }
    },
    save(selection: Selection) {
      const serialized = JSON.stringify(selection);
      const write = pending.then(() =>
        storage.setItem(selectionKey, serialized),
      );
      // A failed write must not block later selections from being saved.
      pending = write.catch(() => {});
      return write;
    },
  };
}
