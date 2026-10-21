import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { accountCopy, accountError } from '@/lib/account-copy';
import { isProviderEnabled } from '@/lib/auth-features';
import { useAuth } from '@/lib/auth-provider';
import { socialSignIn } from '@/lib/auth-service';
import { useLearning } from '@/lib/learning-provider';
import { usePreferences } from '@/lib/preferences-provider';

export function AccountPanel() {
  const { preferences } = usePreferences();
  const t = accountCopy[preferences.language];
  const { account, signOut } = useAuth();
  const { status, retry, importAvailable, decideImport, document } =
    useLearning();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const locked = useRef(false);
  const providers = account?.providers ?? [];
  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMessage('');
    try {
      await action();
    } catch (error) {
      setMessage(accountError(error, preferences.language));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <View className="gap-4 rounded-2xl border border-border bg-surface p-5">
      <Text
        accessibilityRole="header"
        className="text-lg font-semibold text-foreground"
      >
        {account?.email ?? t.title}
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        className="text-sm text-muted-foreground"
      >
        {t[status]}
      </Text>
      {account ? (
        <>
          <Text className="text-sm text-foreground">
            {t.providers}: {providers.join(', ')}
          </Text>
          {isProviderEnabled('apple') && !providers.includes('apple') ? (
            <Action
              label={t.linkApple}
              disabled={busy}
              onPress={() => {
                void run(() => socialSignIn('apple', true));
              }}
            />
          ) : null}
          {isProviderEnabled('google') && !providers.includes('google') ? (
            <Action
              label={t.linkGoogle}
              disabled={busy}
              onPress={() => {
                void run(() => socialSignIn('google', true));
              }}
            />
          ) : null}
          {importAvailable ? (
            <View className="gap-3 border-t border-border pt-4">
              <Text className="text-lg font-semibold text-foreground">
                {t.importTitle}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {t.importDetail}
              </Text>
              <Action
                primary
                label={t.import}
                disabled={busy}
                onPress={() => {
                  void run(() => decideImport(true));
                }}
              />
              <Action
                label={t.skip}
                disabled={busy}
                onPress={() => {
                  void run(() => decideImport(false));
                }}
              />
            </View>
          ) : null}
          {status === 'attention' ? (
            <>
              <Text className="text-sm text-muted-foreground">
                {t.syncDetail}
              </Text>
              <Action label={t.retry} onPress={retry} disabled={busy} />
              <Action
                label={t.signIn}
                onPress={() => router.push('/sign-in')}
                disabled={busy}
              />
            </>
          ) : null}
          {document.pending.length ||
          document.operations.length ||
          document.resetRequestId ? (
            <Text className="text-sm text-muted-foreground">
              {t.pendingSignOut}
            </Text>
          ) : null}
          <Action
            label={t.signOut}
            disabled={busy}
            onPress={() => {
              void run(signOut);
            }}
          />
        </>
      ) : (
        <Action
          primary
          label={t.signIn}
          onPress={() => router.push('/sign-in')}
        />
      )}
      {busy ? (
        <Text accessibilityRole="progressbar" className="text-foreground">
          {t.busy}
        </Text>
      ) : null}
      {message ? (
        <Text accessibilityRole="alert" selectable className="text-error">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
