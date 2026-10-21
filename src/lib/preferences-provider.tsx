import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { Text, View } from 'react-native';
import { Uniwind } from 'uniwind';

import { copy } from '@/lib/copy';
import {
  createPreferencesStorage,
  defaultPreferences,
  type Preferences,
} from '@/lib/preferences-storage';

const storage = createPreferencesStorage(AsyncStorage);
const PreferencesContext = createContext<{
  preferences: Preferences;
  updatePreferences: (update: Partial<Preferences>) => void;
  notice: string;
} | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState({
    preferences: defaultPreferences,
    ready: false,
    edited: false,
  });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void storage.load().then((result) => {
      if (!active) return;
      Uniwind.setTheme(result.preferences.theme);
      setState({ preferences: result.preferences, ready: true, edited: false });
      setFailed(result.failed);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (process.env.EXPO_OS === 'web')
      document.documentElement.lang = state.preferences.language;
  }, [state.preferences.language]);

  useEffect(() => {
    if (!state.edited) return;
    let active = true;
    void storage.save(state.preferences).then(
      () => {
        if (active) setFailed(false);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [state]);

  function updatePreferences(update: Partial<Preferences>) {
    if (update.theme) Uniwind.setTheme(update.theme);
    setState((current) => ({
      ...current,
      preferences: { ...current.preferences, ...update },
      edited: true,
    }));
  }

  if (!state.ready)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text
          accessibilityRole="progressbar"
          className="text-base text-foreground"
        >
          {copy.es.loading}
        </Text>
      </View>
    );

  return (
    <PreferencesContext
      value={{
        preferences: state.preferences,
        updatePreferences,
        notice: failed ? copy[state.preferences.language].preferencesError : '',
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
