import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  createSelectionStorage,
  type Selection,
} from '@/lib/selection-storage';
import { usePreferences } from '@/lib/preferences-provider';

const storage = createSelectionStorage(AsyncStorage);
const SelectionContext = createContext<{
  selection: Selection | null;
  notice: string;
  updateSelection: (update: (selection: Selection) => Selection) => void;
} | null>(null);

export function SelectionProvider({ children }: PropsWithChildren) {
  const { t } = usePreferences();
  const [state, setState] = useState<{
    selection: Selection | null;
    edited: boolean;
  }>({ selection: null, edited: false });
  const [notice, setNotice] = useState<
    '' | 'selectionLoadError' | 'selectionSaveError'
  >('');

  useEffect(() => {
    let active = true;
    void storage.load().then((result) => {
      if (!active) return;
      setState({ selection: result.selection, edited: false });
      setNotice(result.notice);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.selection || !state.edited) return;
    let active = true;
    void storage.save(state.selection).then(
      () => {
        if (active) setNotice('');
      },
      () => {
        if (active) setNotice('selectionSaveError');
      },
    );
    return () => {
      active = false;
    };
  }, [state]);

  function updateSelection(update: (selection: Selection) => Selection) {
    setState((current) =>
      current.selection
        ? { selection: update(current.selection), edited: true }
        : current,
    );
  }

  return (
    <SelectionContext
      value={{
        selection: state.selection,
        notice: notice ? t[notice] : '',
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
