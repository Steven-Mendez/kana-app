import { createContext, use, useState, type PropsWithChildren } from 'react';

import { cards } from '@/data/kana';
import { useLearning } from '@/lib/learning-provider';
import { usePreferences } from '@/lib/preferences-provider';
import type { Selection } from '@/lib/selection-storage';

const SelectionContext = createContext<{
  selection: Selection | null;
  notice: string;
  updateSelection: (update: (selection: Selection) => Selection) => void;
} | null>(null);

export function SelectionProvider({ children }: PropsWithChildren) {
  const { t } = usePreferences();
  const { document, settings } = useLearning();
  const [failed, setFailed] = useState(false);
  const selection = document.selection;
  function updateSelection(update: (selection: Selection) => Selection) {
    const next = update(selection);
    const previous = new Set(selection.kanaIds);
    const wanted = new Set(next.kanaIds);
    const changed = Object.fromEntries(
      cards
        .filter((card) => previous.has(card.id) !== wanted.has(card.id))
        .map((card) => [card.id, wanted.has(card.id)]),
    );
    void settings({
      ...(next.alphabet !== selection.alphabet
        ? { alphabet: next.alphabet }
        : {}),
      selection: changed,
    }).then(
      () => setFailed(false),
      () => setFailed(true),
    );
  }
  return (
    <SelectionContext
      value={{
        selection,
        notice: failed ? t.selectionSaveError : '',
        updateSelection,
      }}
    >
      {children}
    </SelectionContext>
  );
}
export function useSelection() {
  const context = use(SelectionContext);
  if (!context) throw new Error('SelectionProvider is required');
  return context;
}
