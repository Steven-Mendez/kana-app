import '@/global.css';

import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
  usePathname,
  Slot,
} from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useCSSVariable } from 'uniwind';

import { SelectionProvider } from '@/lib/selection-provider';
import {
  PreferencesProvider,
  usePreferences,
} from '@/lib/preferences-provider';
import { supabase } from '@/lib/supabase';
import { useGameFonts } from '@/lib/game-fonts';
import { AuthProvider } from '@/lib/auth-provider';
import { LearningProvider } from '@/lib/learning-provider';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const pathname = usePathname();
  // Legal pages must export real public HTML and remain accessible if storage fails.
  if (pathname === '/privacy' || pathname === '/terms') return <Slot />;
  return (
    <AuthProvider>
      <LearningProvider>
        <PreferencesProvider>
          <AppLayout />
        </PreferencesProvider>
      </LearningProvider>
    </AuthProvider>
  );
}

function AppLayout() {
  const { preferences, t } = usePreferences();
  const pathname = usePathname();
  const fontsReady = useGameFonts();
  const [background, foreground, primary, border] = useCSSVariable([
    '--color-background',
    '--color-foreground',
    '--color-primary',
    '--color-border',
  ]);
  const baseTheme = preferences.theme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background:
        typeof background === 'string'
          ? background
          : baseTheme.colors.background,
      card: typeof background === 'string' ? background : baseTheme.colors.card,
      text: typeof foreground === 'string' ? foreground : baseTheme.colors.text,
      primary: typeof primary === 'string' ? primary : baseTheme.colors.primary,
      border: typeof border === 'string' ? border : baseTheme.colors.border,
    },
  };
  useEffect(() => {
    if (process.env.EXPO_OS === 'web') return;

    const updateAutoRefresh = (state: typeof AppState.currentState) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    updateAutoRefresh(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateAutoRefresh);

    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  // Bundled fonts register within a few frames; rendering before that would
  // flash system fonts in every game component.
  if (!fontsReady) return null;

  return (
    <SelectionProvider>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              title:
                pathname === '/kana'
                  ? t.kana
                  : pathname === '/profile'
                    ? t.profile
                    : 'Kana',
            }}
          />
          <Stack.Screen name="settings" options={{ title: t.settings }} />
          <Stack.Screen name="sign-in" options={{ title: t.signIn }} />
          <Stack.Screen name="auth/callback" options={{ title: t.signIn }} />
          <Stack.Screen
            name="study"
            options={{ title: `${t.practice} · Kana` }}
          />
        </Stack>
      </ThemeProvider>
      <StatusBar style={preferences.theme === 'dark' ? 'light' : 'dark'} />
    </SelectionProvider>
  );
}
