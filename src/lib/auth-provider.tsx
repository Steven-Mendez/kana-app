import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { Text, View } from 'react-native';

import { LegalLinks } from '@/components/legal-links';
import { Action } from '@/components/action';
import { supabase } from '@/lib/supabase';

type AccountIdentity = {
  id: string;
  email: string;
  name: string;
  providers: string[];
};
const identityKey = 'kana-local-account';
const AuthContext = createContext<{
  session: Session | null;
  account: AccountIdentity | null;
  signOut: () => Promise<void>;
} | null>(null);
function identity(user: User): AccountIdentity {
  return {
    id: user.id,
    email: user.email ?? '',
    name:
      typeof user.user_metadata.full_name === 'string'
        ? user.user_metadata.full_name
        : '',
    providers: user.identities?.map((value) => value.provider) ?? [],
  };
}
function parseIdentity(raw: string | null): AccountIdentity | null {
  if (!raw) return null;
  const value = JSON.parse(raw);
  if (
    typeof value.id !== 'string' ||
    !/^[a-f0-9-]{36}$/i.test(value.id) ||
    typeof value.email !== 'string' ||
    typeof value.name !== 'string' ||
    !Array.isArray(value.providers) ||
    !value.providers.every((item: unknown) => typeof item === 'string')
  )
    throw new Error('Invalid local account');
  return value;
}
let identityWrites: Promise<unknown> = Promise.resolve();
function persistAccount(account: AccountIdentity | null) {
  const write = identityWrites.then(() =>
    account
      ? AsyncStorage.setItem(identityKey, JSON.stringify(account))
      : AsyncStorage.removeItem(identityKey),
  );
  identityWrites = write.catch(() => {});
  return write;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AccountIdentity | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    async function restore() {
      await identityWrites;
      const cached = parseIdentity(await AsyncStorage.getItem(identityKey));
      if (!active) return;
      setAccount(cached);
      let observed = false;
      const apply = (next: Session | null) => {
        if (!active) return;
        setSession(next);
        if (next) {
          const owner = identity(next.user);
          setAccount(owner);
          void persistAccount(owner).catch(() => {
            if (active) setError(true);
          });
        }
        // Expired credentials do not erase the offline workspace. This cache is
        // only a local owner label; server authorization always verifies a JWT.
        setReady(true);
      };
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, next) => {
        observed = true;
        apply(next);
      });
      unsubscribe = () => subscription.unsubscribe();
      try {
        const result = await supabase.auth.getSession();
        if (!observed) apply(result.data.session);
      } catch {
        // Network failures must not block a validated local workspace.
        if (!observed) apply(null);
      }
    }
    void restore().catch(() => {
      if (active) setError(true);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [attempt]);
  async function signOut() {
    await persistAccount(null);
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      if (account) await persistAccount(account);
      throw error;
    }
    setSession(null);
    setAccount(null);
  }
  if (!ready)
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        <Text
          className="text-foreground"
          accessibilityRole={error ? 'alert' : 'progressbar'}
        >
          {error
            ? 'No se pudo recuperar la sesión / Could not restore session'
            : 'Cargando / Loading'}
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          Kana · Hiragana y katakana, práctica y repasos con progreso
          sincronizado.
        </Text>
        <LegalLinks />
        {error ? (
          <Action
            label="Reintentar / Retry"
            onPress={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          />
        ) : null}
      </View>
    );
  return (
    <AuthContext value={{ session, account, signOut }}>{children}</AuthContext>
  );
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error('AuthProvider required');
  return value;
}
