import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState, Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';

import { Action } from '@/components/action';
import { useAuth } from '@/lib/auth-provider';
import { accountCopy } from '@/lib/account-copy';
import { learning } from '@/lib/learning';
import type { SettingsPatch } from '@/lib/learning-domain';
import {
  guestFingerprint,
  type LearningDocument,
  type RemoteSnapshot,
} from '@/lib/learning-repository';
import { createLearningSync, startSyncLoop } from '@/lib/learning-sync';
import { defaultPreferences } from '@/lib/preferences-storage';
import { defaultSelection } from '@/lib/selection-storage';
import { supabase } from '@/lib/supabase';
import { reviews as guestReviews } from '@/lib/reviews';

type SyncStatus = 'local' | 'syncing' | 'synced' | 'attention';
const LearningContext = createContext<{
  document: LearningDocument;
  reviews: ReturnType<typeof learning.reviews>;
  settings: (patch: SettingsPatch) => Promise<void>;
  status: SyncStatus;
  retry: () => void;
  importAvailable: boolean;
  decideImport: (accept: boolean) => Promise<void>;
  resetProgress: () => Promise<void>;
} | null>(null);

export function LearningProvider({ children }: PropsWithChildren) {
  const { session, account: identity } = useAuth();
  const account = identity?.id ?? 'guest';
  return (
    <AccountLearning
      key={account}
      account={account}
      tokenVersion={session?.access_token}
    >
      {children}
    </AccountLearning>
  );
}

function AccountLearning({
  account,
  tokenVersion,
  children,
}: PropsWithChildren<{ account: string; tokenVersion?: string }>) {
  const [document, setDocument] = useState<LearningDocument | null>(null);
  const [guest, setGuest] = useState<LearningDocument | null>(null);
  const [failure, setFailure] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<SyncStatus>('local');
  const [remoteReady, setRemoteReady] = useState(false);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const resetIntent = useRef<string | null>(null);
  const reviews = useMemo(
    () => (account === 'guest' ? guestReviews : learning.reviews(account)),
    [account],
  );
  const synchronize = useMemo(
    () =>
      createLearningSync(learning, account, async (payload) => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error || session?.user.id !== account)
          throw new Error('Sign in to synchronize');
        const result = await supabase.functions.invoke<RemoteSnapshot>(
          'sync-learning',
          {
            body: payload,
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        );
        if (result.error || !result.data)
          throw new Error('Synchronization failed');
        return result.data;
      }),
    [account],
  );

  useEffect(() => {
    let active = true;
    let generation = 0;
    const refresh = async () => {
      const ticket = ++generation;
      try {
        const [doc, guestDoc] = await Promise.all([
          learning.read(account),
          learning.read('guest'),
        ]);
        if (active && ticket === generation) {
          setDocument(doc);
          setGuest(guestDoc);
          setFailure(false);
        }
      } catch {
        if (active) setFailure(true);
      }
    };
    const unsubscribe = learning.subscribe((changed) => {
      if (changed === account) void refresh();
    });
    void learning
      .migrate()
      .then(refresh)
      .catch(() => {
        if (active) setFailure(true);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [account, attempt]);

  const ready = document !== null;
  useEffect(() => {
    if (!ready || account === 'guest') return;
    const loop = startSyncLoop({
      repository: learning,
      account,
      synchronize,
      foreground:
        AppState.currentState !== 'background' &&
        AppState.currentState !== 'inactive',
      onStatus: setStatus,
      onSynced: () => setRemoteReady(true),
    });
    const subscription = AppState.addEventListener('change', (state) =>
      loop.setForeground(state === 'active'),
    );
    return () => {
      loop.dispose();
      subscription.remove();
    };
  }, [account, ready, synchronize, syncAttempt, tokenVersion]);

  const settings = useCallback(
    (patch: SettingsPatch) => learning.settings(account, patch),
    [account],
  );
  const decideImport = useCallback(
    (accept: boolean) => learning.decideImport(account, accept),
    [account],
  );
  const resetProgress = useCallback(async () => {
    if (account === 'guest') {
      await learning.requestReset(account);
      return;
    }
    // Keep the intent across manual retries, even if background sync finished it.
    resetIntent.current ??=
      (await learning.read(account)).resetRequestId ?? randomUUID();
    await learning.requestReset(account, resetIntent.current);
    do {
      await synchronize();
    } while ((await learning.read(account)).resetRequestId);
    resetIntent.current = null;
  }, [account, synchronize]);
  if (!document)
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        <Text
          className="text-foreground"
          accessibilityRole={failure ? 'alert' : 'progressbar'}
        >
          {failure ? accountCopy.es.storageError : accountCopy.es.loading}
        </Text>
        {failure ? (
          <Action
            label={accountCopy.es.retry}
            onPress={() => {
              setFailure(false);
              setAttempt((value) => value + 1);
            }}
          />
        ) : null}
      </View>
    );
  const hasGuestData =
    guest &&
    (guest.events.length > 0 ||
      JSON.stringify(guest.preferences) !==
        JSON.stringify(defaultPreferences) ||
      JSON.stringify(guest.selection) !== JSON.stringify(defaultSelection));
  return (
    <LearningContext
      value={{
        document,
        reviews,
        settings,
        status: failure ? 'attention' : status,
        retry: () => {
          setAttempt((value) => value + 1);
          setSyncAttempt((value) => value + 1);
        },
        importAvailable: !!(
          account !== 'guest' &&
          remoteReady &&
          hasGuestData &&
          document.guestDecision !== guestFingerprint(guest)
        ),
        decideImport,
        resetProgress,
      }}
    >
      {children}
    </LearningContext>
  );
}

export function useLearning() {
  const context = use(LearningContext);
  if (!context) throw new Error('LearningProvider required');
  return context;
}
