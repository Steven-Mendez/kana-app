import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { Uniwind } from 'uniwind';

import { copy } from '@/lib/copy';
import { useLearning } from '@/lib/learning-provider';
import type { Preferences } from '@/lib/preferences-storage';

const PreferencesContext = createContext<{
  preferences: Preferences;
  updatePreferences: (update: Partial<Preferences>) => void;
  notice: string;
} | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const { document, settings } = useLearning();
  const [failed, setFailed] = useState(false);
  const preferences = document.preferences;
  useEffect(() => {
    Uniwind.setTheme(preferences.theme);
    if (process.env.EXPO_OS === 'web')
      globalThis.document.documentElement.lang = preferences.language;
  }, [preferences]);
  function updatePreferences(update: Partial<Preferences>) {
    void settings(update).then(
      () => setFailed(false),
      () => setFailed(true),
    );
  }
  return (
    <PreferencesContext
      value={{
        preferences,
        updatePreferences,
        notice: failed ? copy[preferences.language].preferencesError : '',
      }}
    >
      {children}
    </PreferencesContext>
  );
}

export function usePreferences() {
  const context = use(PreferencesContext);
  if (!context) throw new Error('PreferencesProvider is required');
  return { ...context, t: copy[context.preferences.language] };
}
