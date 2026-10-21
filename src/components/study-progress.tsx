import { Text, View } from 'react-native';

import { usePreferences } from '@/lib/preferences-provider';

export function StudyProgress({
  answered,
  total,
  correct,
  streak,
}: {
  answered: number;
  total: number;
  correct: number;
  streak: number;
}) {
  const { t } = usePreferences();
  return (
    <View className="flex-1 gap-2">
      <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1">
        <Text className="text-xs font-medium text-muted-foreground tabular-nums">
          {t.answered(answered, total)}
        </Text>
        <Text className="text-xs font-medium text-success tabular-nums">
          {t.correctCount(correct)}
        </Text>
        <Text
          testID="study-streak"
          className="text-xs font-medium text-muted-foreground tabular-nums"
        >
          {t.streakCount(streak)}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: answered }}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
        />
      </View>
    </View>
  );
}
