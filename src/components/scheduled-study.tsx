import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Skeleton } from '@/components/game/layout';
import { Screen } from '@/components/screen';
import { StudySession } from '@/components/study-session';
import type { KanaCard } from '@/data/kana';
import { dailyStreak } from '@/lib/game-streak';
import type { InputMode } from '@/lib/input-mode';
import { usePreferences } from '@/lib/preferences-provider';
import {
  hydrateProgress,
  reviewQueue,
  type KanaProgress,
} from '@/lib/kana-mastery';
import { useLearning } from '@/lib/learning-provider';
import type { ReviewRequest } from '@/lib/review-storage';

export function ScheduledStudy({
  cards,
  dueOnly = false,
  length,
  inputMode,
  confusedWith,
  onConfusion,
}: {
  cards: KanaCard[];
  dueOnly?: boolean;
  length?: number;
  inputMode?: InputMode;
  confusedWith?: (cardId: string) => string[];
  onConfusion?: (cardId: string, confusedId: string) => void;
}) {
  const { t, preferences } = usePreferences();
  const { reviews, document } = useLearning();
  // The streak as it stood when the round began, to celebrate extending it.
  const [streakBefore] = useState(() => dailyStreak(document.events));
  const streakNow = useMemo(
    () => dailyStreak(document.events),
    [document.events],
  );
  const progressRef = useRef(new Map<string, KanaProgress>());
  // Every answer is saved; the daily allowance keeps drilling from inflating mastery.
  const commit = useCallback(
    async (request: ReviewRequest) => {
      const saved = await reviews.commit(request);
      progressRef.current.set(request.cardId, hydrateProgress(saved.mastery));
      return saved;
    },
    [reviews],
  );
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<
    | { status: 'loading' | 'error' }
    | {
        status: 'ready';
        cards: KanaCard[];
        nextDue: Date | null;
        progress: Map<string, KanaProgress>;
      }
  >({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void reviews.load(cards.map((card) => card.id)).then(
      (progress) => {
        if (active) {
          progressRef.current = progress;
          setState({
            status: 'ready',
            progress,
            ...(dueOnly
              ? reviewQueue(cards, progress, new Date())
              : { cards, nextDue: null }),
          });
        }
      },
      () => {
        if (active) setState({ status: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [cards, attempt, dueOnly, reviews]);

  if (state.status === 'ready' && state.cards.length)
    return (
      <StudySession
        cards={state.cards}
        progress={state.progress}
        onCommitReview={commit}
        length={length}
        inputMode={inputMode}
        confusedWith={confusedWith}
        onConfusion={onConfusion}
        streak={{ before: streakBefore, after: streakNow }}
      />
    );

  // Loading keeps the round's shape: header, card and answer area.
  if (state.status === 'loading')
    return (
      <Screen>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={t.loading}
          className="flex-1 items-center"
        >
          <View className="w-full max-w-lg gap-4 px-4 pt-3 sm:px-6">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-40" />
          </View>
          <View className="flex-1 items-center pt-8">
            <View testID="study-skeleton-card">
              <Skeleton className="h-[236px] w-[196px] rounded-card" />
            </View>
          </View>
          <View className="w-full max-w-lg px-4 pb-4 sm:px-6">
            <Skeleton className="h-14 w-full rounded-2xl" />
          </View>
        </View>
      </Screen>
    );

  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text
          accessibilityRole="header"
          className="text-xl font-semibold text-foreground"
        >
          {t.scheduledReview}
        </Text>
        <Text
          accessibilityRole={state.status === 'error' ? 'alert' : undefined}
          className="text-center text-base text-foreground"
        >
          {state.status === 'error' ? t.reviewLoadError : t.nothingDue}
        </Text>
        {state.status === 'ready' && state.nextDue ? (
          <Text className="text-center text-[13px] text-muted-foreground">
            {t.nextReview(state.nextDue.toLocaleString(preferences.language))}
          </Text>
        ) : null}
        <Action
          primary
          label={state.status === 'error' ? t.retry : t.refreshReviews}
          onPress={() => {
            setState({ status: 'loading' });
            setAttempt((value) => value + 1);
          }}
        />
        <Action
          label={t.changeSelection}
          onPress={() => router.dismissTo('/kana')}
        />
      </View>
    </Screen>
  );
}
