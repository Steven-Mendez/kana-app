import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { LegalLinks } from '@/components/legal-links';
import { Action } from '@/components/action';
import { AppleAccessButton } from '@/components/apple-access-button';
import { PageHeading } from '@/components/page-heading';
import { Screen } from '@/components/screen';
import { isEmailAuthEnabled, isProviderEnabled } from '@/lib/auth-features';
import { accountCopy, accountError } from '@/lib/account-copy';
import {
  sendEmailCode,
  socialSignIn,
  verifyEmailCode,
} from '@/lib/auth-service';
import { usePreferences } from '@/lib/preferences-provider';

export default function SignInScreen() {
  const { preferences } = usePreferences();
  const t = accountCopy[preferences.language];
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const timeout = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown]);
  async function run(action: () => Promise<void>, complete = false) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMessage('');
    try {
      await action();
      if (complete) router.replace('/profile');
    } catch (error) {
      setMessage(accountError(error, preferences.language));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const send = () =>
    run(async () => {
      await sendEmailCode(email);
      setSent(true);
      setCooldown(60);
      setCode('');
    });
  return (
    <Screen navigation>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerClassName="items-center"
      >
        <View className="w-full max-w-lg gap-5 px-4 py-6">
          <PageHeading title={t.title} description={t.description} />
          {isProviderEnabled('apple') ? (
            <AppleAccessButton
              label={t.apple}
              disabled={busy}
              onPress={() => {
                void run(
                  () => socialSignIn('apple'),
                  process.env.EXPO_OS !== 'web',
                );
              }}
            />
          ) : null}
          {isProviderEnabled('google') ? (
            <Action
              primary
              label={t.google}
              disabled={busy}
              onPress={() => {
                void run(
                  () => socialSignIn('google'),
                  process.env.EXPO_OS !== 'web',
                );
              }}
            />
          ) : null}
          {isEmailAuthEnabled() ? (
            <>
              <Text className="text-sm text-muted-foreground">{t.email}</Text>
              <TextInput
                accessibilityLabel={t.email}
                autoComplete="email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!busy && !sent}
                className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
              />
              {sent ? (
                <>
                  <Text className="text-sm text-muted-foreground">
                    {t.sent}
                  </Text>
                  <TextInput
                    accessibilityLabel={t.code}
                    autoComplete="one-time-code"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                    editable={!busy}
                    maxLength={10}
                    onSubmitEditing={() => {
                      if (code.trim())
                        void run(() => verifyEmailCode(email, code), true);
                    }}
                    className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                  />
                  <Action
                    primary
                    label={t.verify}
                    disabled={busy || !code.trim()}
                    onPress={() => {
                      void run(() => verifyEmailCode(email, code), true);
                    }}
                  />
                  <Action
                    label={cooldown ? `${t.resend} (${cooldown})` : t.resend}
                    disabled={busy || cooldown > 0}
                    onPress={() => {
                      void send();
                    }}
                  />
                  <Action
                    label={t.changeEmail}
                    disabled={busy}
                    onPress={() => {
                      setSent(false);
                      setCode('');
                      setMessage('');
                    }}
                  />
                </>
              ) : (
                <Action
                  primary
                  label={t.send}
                  disabled={
                    busy ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
                    cooldown > 0
                  }
                  onPress={() => {
                    void send();
                  }}
                />
              )}
            </>
          ) : null}
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
          <Action
            label={t.guest}
            disabled={busy}
            onPress={() => router.replace('/practice')}
          />
          <LegalLinks language={preferences.language} />
        </View>
      </ScrollView>
    </Screen>
  );
}
