import { Text, View } from 'react-native';

import { usePreferences } from '@/lib/preferences-provider';

export function StudyProgress({
  answered,
  correct,
  streak,
}: {
  answered: number;
  correct: number;
  streak: number;
}) {
  const { t } = usePreferences();
  return (
    <View className="flex-1 gap-2">
      <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1">
        <Text className="text-xs font-medium text-muted-foreground tabular-nums">
          {t.answered(answered)}
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
    </View>
  );
}
