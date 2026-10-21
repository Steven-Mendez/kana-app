import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Action } from '@/components/action';
import { PageHeading } from '@/components/page-heading';
import {
  AlphabetCoverage,
  DueReview,
  ProgressBar,
  ProgressNotice,
} from '@/components/progress-overview';
import { Screen } from '@/components/screen';
import { cards } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { useStudyProgress } from '@/lib/use-study-progress';

export default function ProgressScreen() {
  const { t } = usePreferences();
  const progress = useStudyProgress();
  const data = progress.data;
  return (
    <Screen navigation>
      <ScrollView contentContainerClassName="items-center">
        <View className="w-full max-w-2xl gap-6 px-5 py-6 sm:px-6 sm:py-10">
          <PageHeading title={t.progress} description={t.progressDetail} />
          {data ? (
            <>
              <View className="gap-6 rounded-3xl bg-surface p-6">
                <Text className="text-xs font-bold tracking-widest text-primary">
                  {t.progressEyebrow}
                </Text>
                <View className="flex-row flex-wrap items-end gap-3">
                  <Text className="text-6xl font-semibold tracking-tight text-primary">
                    {data.reviewed}
                  </Text>
                  <Text className="pb-2 text-base text-muted-foreground">
                    / {cards.length} · {t.reviewedKana}
                  </Text>
                </View>
                <ProgressBar
                  value={data.reviewed}
                  total={cards.length}
                  label={t.reviewedKana}
                />
                <Text className="text-sm leading-6 text-muted-foreground">
                  {t.coverageDetail}
                </Text>
                <View className="flex-row flex-wrap gap-4 border-t border-border pt-5">
                  {[
                    [t.reviewedToday, data.today],
                    [t.savedReviews, data.reviews],
                    [t.pending, data.due.length],
                  ].map(([label, value]) => (
                    <View key={label} className="min-w-24 flex-1 gap-1">
                      <Text className="text-2xl font-semibold text-foreground">
                        {value}
                      </Text>
                      <Text className="text-xs leading-5 text-muted-foreground">
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="gap-4">
                <Text
                  accessibilityRole="header"
                  className="text-xl font-semibold text-foreground"
                >
                  {t.memoryStages}
                </Text>
                <View className="gap-5 rounded-3xl bg-surface p-6">
                  {(
                    ['unseen', 'learning', 'relearning', 'scheduled'] as const
                  ).map((stage) => (
                    <View key={stage} className="gap-2">
                      <View className="flex-row justify-between gap-3">
                        <Text className="flex-1 text-base text-foreground">
                          {t[stage]}
                        </Text>
                        <Text className="text-base font-semibold text-foreground">
                          {data[stage]}
                        </Text>
                      </View>
                      <ProgressBar
                        value={data[stage]}
                        total={cards.length}
                        label={t[stage]}
                        green={stage === 'scheduled'}
                      />
                    </View>
                  ))}
                </View>
              </View>
              <AlphabetCoverage data={data} />
              <DueReview data={data} />
              {!data.reviewed ? (
                <Action
                  primary
                  label={t.configurePractice}
                  onPress={() => router.navigate('/practice')}
                />
              ) : null}
              <Action label={t.refreshReviews} onPress={progress.refresh} />
            </>
          ) : (
            <ProgressNotice
              status={progress.status}
              onRetry={progress.refresh}
            />
          )}
          <Text className="text-center text-xs leading-5 text-muted-foreground">
            {t.progressLocalDetail}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
