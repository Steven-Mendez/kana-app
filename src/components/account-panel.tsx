import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { SectionLabel, TextAction } from '@/components/game/layout';
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
  const [confirming, setConfirming] = useState(false);
  const locked = useRef(false);
  const providers = account?.providers ?? [];
  const pending = Boolean(
    document.pending.length ||
    document.operations.length ||
    document.resetRequestId,
  );
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
  const linkApple = isProviderEnabled('apple') && !providers.includes('apple');
  const linkGoogle =
    isProviderEnabled('google') && !providers.includes('google');
  return (
    <View className="gap-3">
      <SectionLabel>{t.title}</SectionLabel>
      {/* The hero already shows the email when the account has no name. */}
      {account?.name ? (
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          className="font-ui text-[13px] text-muted-foreground"
        >
          {account.email}
        </Text>
      ) : null}
      <Text
        accessibilityLiveRegion="polite"
        className="font-ui text-[15px] text-foreground"
      >
        {t[status]}
      </Text>
      {account ? (
        <>
          <Text className="font-ui text-[13px] text-muted-foreground">
            {t.providers}: {providers.join(', ')}
          </Text>
          {importAvailable ? (
            <View className="gap-3 pt-2">
              <Text className="font-ui-bold text-lg text-foreground">
                {t.importTitle}
              </Text>
              <Text className="font-ui text-[15px] text-muted-foreground">
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
              <TextAction
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
              <Text className="font-ui text-[15px] text-muted-foreground">
                {t.syncDetail}
              </Text>
              <Action
                variant="quiet"
                label={t.retry}
                onPress={retry}
                disabled={busy}
              />
              <TextAction
                label={t.signIn}
                onPress={() => router.push('/sign-in')}
                disabled={busy}
              />
            </>
          ) : null}
          {linkApple || linkGoogle ? (
            <View className="flex-row flex-wrap gap-x-6">
              {linkApple ? (
                <TextAction
                  label={t.linkApple}
                  disabled={busy}
                  onPress={() => {
                    void run(() => socialSignIn('apple', true));
                  }}
                />
              ) : null}
              {linkGoogle ? (
                <TextAction
                  label={t.linkGoogle}
                  disabled={busy}
                  onPress={() => {
                    void run(() => socialSignIn('google', true));
                  }}
                />
              ) : null}
            </View>
          ) : null}
          {confirming ? (
            <View className="gap-3 pt-2">
              <Text
                accessibilityRole="alert"
                className="font-ui text-[15px] text-foreground"
              >
                {t.pendingSignOut}
              </Text>
              <Action
                variant="destructive"
                label={t.signOutAnyway}
                disabled={busy}
                onPress={() => {
                  void run(signOut);
                }}
              />
              <TextAction
                label={t.cancel}
                disabled={busy}
                onPress={() => setConfirming(false)}
              />
            </View>
          ) : (
            <TextAction
              tone="muted"
              label={t.signOut}
              disabled={busy}
              onPress={() => {
                // Unsynced changes stay on this device, so ask before leaving.
                if (pending) setConfirming(true);
                else void run(signOut);
              }}
            />
          )}
        </>
      ) : (
        <>
          <Text className="font-ui text-[15px] text-muted-foreground">
            {t.description}
          </Text>
          <Action
            primary
            label={t.signIn}
            onPress={() => router.push('/sign-in')}
          />
        </>
      )}
      {message ? (
        <Text
          accessibilityRole="alert"
          selectable
          className="font-ui text-[13px] text-error"
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
