import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { alphabetLabels } from '@/data/kana';
import { roundScore, type Round } from '@/lib/study';
import { usePreferences } from '@/lib/preferences-provider';

export function StudyResults({
  round,
  onReview,
  onRepeat,
  onFinish,
}: {
  round: Round;
  onReview: () => void;
  onRepeat: () => void;
  onFinish?: () => void;
}) {
  const { t } = usePreferences();
  const { correct, mistakes, accuracy, bestStreak } = roundScore(round);
  const corrections = round.grades.filter((grade) => !grade.correct);
  return (
    <View className="w-full max-w-lg gap-6 px-4 py-6 sm:px-6">
      <View className="items-center gap-2 py-2">
        <Text
          accessibilityRole="header"
          className="text-base font-medium text-muted-foreground"
        >
          {t.completed}
        </Text>
        <Text
          selectable
          className={`text-7xl font-semibold tracking-tight tabular-nums ${accuracy >= 90 ? 'text-success' : accuracy < 60 ? 'text-error' : 'text-foreground'}`}
        >
          {accuracy}%
        </Text>
        <Text className="text-sm text-muted-foreground">
          {t.accuracy} · {t.answered(round.grades.length)}
        </Text>
        <Text className="text-center text-base text-foreground">
          {t.totals(correct, mistakes.length)}
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-between gap-4 border-y border-border py-4">
        <ResultMetric label={t.correctTotal} value={correct} />
        <ResultMetric label={t.mistakesTotal} value={mistakes.length} />
        <ResultMetric
          label={t.bestStreak}
          value={bestStreak}
          testID="result-best-streak"
        />
      </View>
      <View className="gap-2">
        {onFinish ? (
          <>
            <Text className="text-center text-sm text-muted-foreground">
              {t.scheduledComplete}
            </Text>
            <Action primary label={t.changeSelection} onPress={onFinish} />
          </>
        ) : (
          <>
            {mistakes.length ? (
              <Action primary label={t.review} onPress={onReview} />
            ) : (
              <Text className="py-2 text-center text-base text-success">
                {t.perfect}
              </Text>
            )}
            <Action
              primary={!mistakes.length}
              label={t.repeat}
              onPress={onRepeat}
            />
          </>
        )}
      </View>
      {corrections.length ? (
        <View className="gap-3">
          <View className="gap-1">
            <Text
              accessibilityRole="header"
              className="text-lg font-semibold text-foreground"
            >
              {t.toReview}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {t.correctionDetail}
            </Text>
          </View>
          {corrections.map(({ card, answer, attempt }) => (
            <View
              key={`${card.id}:${attempt}`}
              testID={`correction-${card.id}`}
              className="flex-row items-start gap-4 border-b border-border py-3"
            >
              <Text selectable className="min-w-16 text-3xl text-foreground">
                {card.kana}
              </Text>
              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted-foreground">
                  {alphabetLabels[card.alphabet]}
                </Text>
                <Text selectable className="text-sm text-error">
                  {answer === null ? t.revealedShort : t.yourAnswer(answer)}
                </Text>
                <Text
                  selectable
                  className="text-lg font-semibold text-foreground"
                >
                  {card.reading}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ResultMetric({
  label,
  value,
  testID,
}: {
  label: string;
  value: number;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className="min-w-20 flex-1 items-center gap-1"
    >
      <Text className="text-2xl font-semibold text-foreground tabular-nums">
        {value}
      </Text>
      <Text className="text-center text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
