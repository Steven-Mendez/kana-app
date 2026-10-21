import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Screen } from '@/components/screen';
import { accountCopy } from '@/lib/account-copy';
import { isSocialAuthEnabled } from '@/lib/auth-features';
import { finishOAuth } from '@/lib/auth-service';
import { usePreferences } from '@/lib/preferences-provider';

export default function AuthCallback() {
  const { code, error } = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();
  const { preferences } = usePreferences();
  const t = accountCopy[preferences.language];
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    if (!isSocialAuthEnabled() || error || !code || typeof code !== 'string')
      return;
    void finishOAuth(code).then(
      () => {
        if (!active) return;
        if (process.env.EXPO_OS === 'web')
          window.history.replaceState(null, '', '/auth/callback');
        router.replace('/profile');
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [code, error]);
  const hasError =
    !isSocialAuthEnabled() ||
    failed ||
    !!error ||
    !code ||
    typeof code !== 'string';
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text
          accessibilityRole={hasError ? 'alert' : 'progressbar'}
          className="text-foreground"
        >
          {hasError ? t.error : t.busy}
        </Text>
        {hasError ? (
          <Action label={t.signIn} onPress={() => router.replace('/sign-in')} />
        ) : null}
      </View>
    </Screen>
  );
}
