import { useEffect } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Burst } from '@/components/game/burst';
import { GameButton } from '@/components/game/game-button';
import { GamePanel } from '@/components/game/game-panel';
import { Divider, TextAction } from '@/components/game/layout';
import { Rise } from '@/components/game/rise';
import { StreakBadge } from '@/components/game/streak-badge';
import { alphabetLabels } from '@/data/kana';
import { formatDuration, gameScore } from '@/lib/game-score';
import {
  extendedToday,
  isMilestone,
  type DailyStreak,
} from '@/lib/game-streak';
import { celebrateHaptic } from '@/lib/haptics';
import { rise, springs, stagger } from '@/lib/motion';
import { playSound } from '@/lib/sounds';
import { usePreferences } from '@/lib/preferences-provider';
import { roundScore, type Round } from '@/lib/study';
import { cn } from '@/lib/utils';

// The grade lands first; the streak panel, the scores and the rest follow it.
const STREAK_AT = 380;
const SCORES_AT = 520;
const SCORE_STEP = stagger * 2;

/**
 * End of a round: grade, scores and corrections scroll above a footer that
 * keeps the next actions within thumb reach.
 */
export function StudyResults({
  round,
  duration,
  streak,
  note,
  onReview,
  onRepeat,
  onChangeSelection,
  onFinish,
}: {
  round: Round;
  duration: number;
  streak?: { before: DailyStreak; after: DailyStreak };
  /** Explains how long these results last, below the corrections. */
  note?: string;
  onReview: () => void;
  onRepeat: () => void;
  onChangeSelection: () => void;
  onFinish?: () => void;
}) {
  const { t } = usePreferences();
  const reduced = useReducedMotion();
  const { correct, mistakes, accuracy, bestStreak } = roundScore(round);
  const { points, grade } = gameScore(round.grades);
  const corrections = round.grades.filter((grade) => !grade.correct);
  const submitted = (answer: string | null) =>
    answer === null ? t.revealedShort : t.yourAnswer(answer);
  const celebrate =
    streak && extendedToday(streak.before, streak.after) ? streak.after : null;

  const scoresAt = celebrate ? SCORES_AT + 260 : SCORES_AT;
  const enter = (delay: number) => (reduced ? undefined : rise(delay));

  // Results celebrate once on mount; the streak sound waits for the flame.
  const perfect = correct > 0 && !mistakes.length;
  const extended = !!celebrate;
  useEffect(() => {
    celebrateHaptic();
    playSound(perfect ? 'perfect' : 'complete');
    if (!extended) return;
    const timer = setTimeout(() => playSound('streak'), STREAK_AT + 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="min-h-0 flex-1">
      <ScrollView contentContainerClassName="grow items-center">
        <View className="w-full max-w-lg gap-8 px-4 py-6 sm:px-6">
          <View className="items-center gap-4">
            <Text
              accessibilityRole="header"
              className="text-center font-display text-[28px] leading-[34px] text-foreground"
            >
              {t.gameRoundComplete}
            </Text>
            <GradeStamp
              grade={grade}
              label={grade ? t.gameGrade(grade) : t.completed}
            />
            <View className="items-center gap-1">
              <Text className="text-center font-ui text-base text-foreground">
                {t.totals(correct, mistakes.length)}
              </Text>
              {!onFinish && !mistakes.length ? (
                <Text className="text-center font-ui-bold text-base text-success">
                  {t.perfect}
                </Text>
              ) : null}
            </View>
          </View>

          {celebrate ? (
            <Animated.View entering={enter(STREAK_AT)}>
              <GamePanel emphasis="loud" testID="result-daily-streak">
                <View className="flex-row items-center gap-4">
                  <Image
                    source={require('../../assets/icon.png')}
                    accessible={false}
                    accessibilityIgnoresInvertColors
                    className="size-14 rounded-full"
                  />
                  <View className="flex-1 gap-1">
                    <StreakBadge
                      days={celebrate.days}
                      state={
                        isMilestone(celebrate.days) ? 'milestone' : 'active'
                      }
                      ignite
                      delay={STREAK_AT + 200}
                    />
                    <Text className="font-ui-bold text-base text-foreground">
                      {isMilestone(celebrate.days)
                        ? t.gameStreakMilestone
                        : t.gameStreakExtended(celebrate.days)}
                    </Text>
                    <Text className="font-ui text-[13px] text-muted-foreground">
                      {t.gameStreakKeep}
                    </Text>
                  </View>
                </View>
              </GamePanel>
            </Animated.View>
          ) : null}

          <View className="flex-row">
            <ScoreStat
              label={t.gamePoints}
              value={String(points)}
              tone="text-tangerine-text"
              entering={enter(scoresAt)}
            />
            <ScoreStat
              label={t.gameAccuracy}
              value={`${accuracy}%`}
              entering={enter(scoresAt + SCORE_STEP)}
            />
            <ScoreStat
              label={t.gameTime}
              value={formatDuration(duration)}
              entering={enter(scoresAt + SCORE_STEP * 2)}
            />
            <ScoreStat
              label={t.bestStreak}
              value={String(bestStreak)}
              testID="result-best-streak"
              entering={enter(scoresAt + SCORE_STEP * 3)}
            />
          </View>

          {corrections.length ? (
            <View className="gap-3">
              <View className="gap-1">
                <Text
                  accessibilityRole="header"
                  className="font-ui-bold text-lg text-foreground"
                >
                  {t.toReview}
                </Text>
                <Text className="font-ui text-[13px] text-muted-foreground">
                  {t.correctionDetail}
                </Text>
              </View>
              <View>
                {corrections.map(({ card, answer, attempt }, index) => (
                  <Rise
                    key={`${card.id}:${attempt}`}
                    index={Math.min(index, 8)}
                    delay={scoresAt + SCORE_STEP * 4}
                  >
                    {index > 0 ? <Divider /> : null}
                    <View
                      testID={`correction-${card.id}`}
                      className="flex-row items-center gap-4 py-3"
                    >
                      <Text
                        selectable
                        className="min-w-14 text-center font-kana text-3xl text-foreground"
                      >
                        {card.kana}
                      </Text>
                      <View className="flex-1 gap-1">
                        <Text
                          selectable
                          className="font-ui-bold text-base text-foreground"
                        >
                          {card.reading}
                        </Text>
                        <Text
                          selectable
                          numberOfLines={1}
                          accessibilityLabel={submitted(answer)}
                          className="font-ui text-[13px] text-muted-foreground"
                        >
                          {`✕ ${submitted(answer)}`}
                        </Text>
                      </View>
                      <Text className="font-ui text-[13px] text-muted-foreground">
                        {alphabetLabels[card.alphabet]}
                      </Text>
                    </View>
                  </Rise>
                ))}
              </View>
            </View>
          ) : null}

          {note ? (
            <Text className="text-center font-ui text-[13px] text-muted-foreground">
              {note}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="items-center border-t border-foreground/10 bg-background">
        <View className="w-full max-w-lg gap-3 px-4 pb-4 pt-4 sm:px-6">
          {onFinish ? (
            <>
              <Text className="text-center font-ui text-[13px] text-muted-foreground">
                {t.scheduledComplete}
              </Text>
              <GameButton block onPress={onFinish}>
                {t.changeSelection}
              </GameButton>
            </>
          ) : (
            <>
              {mistakes.length ? (
                <GameButton block onPress={onReview}>
                  {t.review}
                </GameButton>
              ) : null}
              <GameButton
                block
                variant={mistakes.length ? 'quiet' : 'primary'}
                onPress={onRepeat}
              >
                {t.repeat}
              </GameButton>
              <View className="items-center">
                <TextAction
                  tone="muted"
                  label={t.changeSelection}
                  testID="results-change-selection"
                  onPress={onChangeSelection}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

/** The grade lands like a rubber stamp, settling from slightly large. */
function GradeStamp({ grade, label }: { grade: string | null; label: string }) {
  const reduced = useReducedMotion();
  const landed = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    landed.set(withSpring(1, { ...springs.pop, duration: 450 }));
  }, [reduced, landed]);
  // Slammed down from above the page, turning into its tilt; sparks fly
  // as it hits.
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, landed.get() * 3),
    transform: [
      { scale: 1.4 - 0.4 * landed.get() },
      { rotate: `${-14 * (1 - landed.get())}deg` },
    ],
  }));
  return (
    <View className="items-center justify-center">
      <Burst count={grade === 'S' ? 12 : 8} radius={92} size={16} delay={140} />
      <Animated.View style={style}>
        <View
          accessible
          accessibilityLabel={label}
          testID="result-grade"
          className="size-[120px] -rotate-[8deg] items-center justify-center rounded-full border-[6px] border-primary bg-card"
        >
          <View className="absolute inset-[5px] rounded-full border-[3px] border-primary" />
          <Text className="font-display text-[64px] leading-[70px] text-primary">
            {grade ?? '—'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/** One score in the inline row: value over a metadata label, no tile. */
function ScoreStat({
  label,
  value,
  tone = 'text-foreground',
  testID,
  entering,
}: {
  label: string;
  value: string;
  tone?: string;
  testID?: string;
  entering?: ReturnType<typeof rise>;
}) {
  return (
    <Animated.View
      entering={entering}
      testID={testID}
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className="flex-1 items-center gap-1 px-1"
    >
      <Text
        numberOfLines={1}
        className={cn('font-ui-bold text-xl tabular-nums', tone)}
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        className="text-center font-ui text-[13px] text-muted-foreground"
      >
        {label}
      </Text>
    </Animated.View>
  );
}
