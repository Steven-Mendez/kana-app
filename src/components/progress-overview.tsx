import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { alphabetLabels } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { dueStudyParams, type summarizeProgress } from '@/lib/study-progress';

type Progress = ReturnType<typeof summarizeProgress>;

export function ProgressBar({
  value,
  total,
  label,
  green = false,
}: {
  value: number;
  total: number;
  label: string;
  green?: boolean;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: total, now: value }}
      className="h-2 overflow-hidden rounded-full bg-muted"
    >
      <View
        className={`h-full rounded-full ${green ? 'bg-success' : 'bg-primary'}`}
        style={{
          width: `${total ? Math.min(100, (value / total) * 100) : 0}%`,
        }}
      />
    </View>
  );
}

export function AlphabetCoverage({ data }: { data: Progress }) {
  const { t } = usePreferences();
  return (
    <View className="gap-5 rounded-3xl bg-surface p-5 sm:p-6">
      {data.alphabets.map(({ alphabet, reviewed, total }, index) => (
        <View
          key={alphabet}
          className={`gap-3 ${index ? 'border-t border-border pt-5' : ''}`}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Text
                className={`text-2xl ${index ? 'text-success' : 'text-primary'}`}
              >
                {index ? 'ア' : 'あ'}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-lg font-semibold text-foreground">
                {alphabetLabels[alphabet]}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {t.coverage(reviewed, total)}
              </Text>
            </View>
            <Text
              className={`text-xl font-semibold ${index ? 'text-success' : 'text-primary'}`}
            >
              {Math.round((reviewed / total) * 100)}%
            </Text>
          </View>
          <ProgressBar
            value={reviewed}
            total={total}
            label={alphabetLabels[alphabet]}
            green={index === 1}
          />
        </View>
      ))}
    </View>
  );
}

export function ProgressNotice({
  status,
  onRetry,
}: {
  status: 'loading' | 'error';
  onRetry: () => void;
}) {
  const { t } = usePreferences();
  return (
    <View className="gap-4 rounded-3xl bg-surface p-6">
      <Text
        accessibilityRole={status === 'error' ? 'alert' : 'progressbar'}
        className="text-base leading-6 text-muted-foreground"
      >
        {status === 'loading' ? t.loading : t.reviewLoadError}
      </Text>
      {status === 'error' ? <Action label={t.retry} onPress={onRetry} /> : null}
    </View>
  );
}

export function DueReview({ data }: { data: Progress }) {
  const { t, preferences } = usePreferences();
  return (
    <View className="gap-4 rounded-3xl bg-surface p-5 sm:p-6">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text
          accessibilityRole="header"
          className="text-xl font-semibold text-foreground"
        >
          {t.dueReview}
        </Text>
        <Text className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-primary">
          {t.pendingCount(data.due.length)}
        </Text>
      </View>
      {data.due.length ? (
        <>
          <Text className="text-sm leading-6 text-muted-foreground">
            {t.dueDetail}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {data.due.slice(0, 5).map((card) => (
              <View
                key={card.id}
                className="min-h-12 min-w-12 items-center justify-center rounded-full bg-muted px-3 py-2"
              >
                <Text className="text-2xl text-foreground">{card.kana}</Text>
              </View>
            ))}
          </View>
          <Action
            label={t.reviewDue}
            primary
            onPress={() =>
              router.navigate({
                pathname: '/study',
                params: dueStudyParams(data.due),
              })
            }
          />
        </>
      ) : (
        <>
          <Text className="text-base font-semibold text-foreground">
            {data.reviewed ? t.allCaughtUp : t.noProgress}
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            {data.reviewed ? t.allCaughtUpDetail : t.noProgressDetail}
          </Text>
          {data.next ? (
            <Text className="text-sm text-muted-foreground">
              {t.nextReview(data.next.toLocaleString(preferences.language))}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}
