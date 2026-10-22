import { Text } from 'react-native';

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
    <Text
      testID="study-summary"
      accessibilityLiveRegion="polite"
      className="flex-1 text-sm font-medium text-muted-foreground tabular-nums"
    >
      {t.answered(answered)} · {t.correctCount(correct)}
      {/* A streak of one is just the last answer; show it once it means something. */}
      {streak >= 2 ? (
        <Text testID="study-streak"> · {t.streakCount(streak)}</Text>
      ) : null}
    </Text>
  );
}
