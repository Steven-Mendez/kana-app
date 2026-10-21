import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Card } from 'ts-fsrs';
import { hydrateCard, type ReviewRequest } from '@/lib/review-storage';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Screen } from '@/components/screen';
import { StudySession } from '@/components/study-session';
import type { KanaCard } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { reviews } from '@/lib/reviews';
import { reviewQueue, shouldSchedulePractice } from '@/lib/spaced-repetition';

export function ScheduledStudy({
  cards,
  dueOnly = false,
}: {
  cards: KanaCard[];
  dueOnly?: boolean;
}) {
  const { t, preferences } = usePreferences();
  const progressRef = useRef(new Map<string, Card>());
  const commit = useCallback(async (request: ReviewRequest) => {
    if (
      !shouldSchedulePractice(
        progressRef.current.get(request.cardId),
        request.rating,
        request.reviewedAt,
      )
    ) {
      return { practiceOnly: true as const };
    }
    const saved = await reviews.commit(request);
    progressRef.current.set(request.cardId, hydrateCard(saved.card));
    return saved;
  }, []);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<
    | { status: 'loading' | 'error' }
    | {
        status: 'ready';
        cards: KanaCard[];
        nextDue: Date | null;
        progress: Map<string, Card>;
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
              ? reviewQueue(
                  cards.filter(
                    (card) => (progress.get(card.id)?.reps ?? 0) > 0,
                  ),
                  progress,
                  new Date(),
                )
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
  }, [cards, attempt, dueOnly]);

  if (state.status === 'ready' && state.cards.length)
    return (
      <StudySession
        cards={state.cards}
        progress={state.progress}
        onCommitReview={commit}
      />
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
          accessibilityRole={
            state.status === 'error'
              ? 'alert'
              : state.status === 'loading'
                ? 'progressbar'
                : undefined
          }
          className="text-center text-base text-foreground"
        >
          {state.status === 'loading'
            ? t.loading
            : state.status === 'error'
              ? t.reviewLoadError
              : t.nothingDue}
        </Text>
        {state.status === 'ready' && state.nextDue ? (
          <Text className="text-center text-sm text-muted-foreground">
            {t.nextReview(state.nextDue.toLocaleString(preferences.language))}
          </Text>
        ) : null}
        {state.status !== 'loading' ? (
          <Action
            primary
            label={state.status === 'error' ? t.retry : t.refreshReviews}
            onPress={() => {
              setState({ status: 'loading' });
              setAttempt((value) => value + 1);
            }}
          />
        ) : null}
        <Action
          label={t.changeSelection}
          onPress={() => router.dismissTo('/practice')}
        />
      </View>
    </Screen>
  );
}
