import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Action } from '@/components/action';
import {
  AlphabetCoverage,
  DueReview,
  ProgressNotice,
} from '@/components/progress-overview';
import { Screen } from '@/components/screen';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { selectedCards } from '@/lib/study';
import { useStudyProgress } from '@/lib/use-study-progress';

export default function HomeScreen() {
  const { t } = usePreferences();
  const { selection, notice } = useSelection();
  const progress = useStudyProgress();
  const selected = selection ? selectedCards(selection.kanaIds) : [];
  return (
    <Screen navigation>
      <ScrollView contentContainerClassName="items-center">
        <View className="w-full max-w-2xl gap-6 px-5 py-6 sm:gap-8 sm:px-6 sm:py-10">
          <View className="gap-2">
            <Text
              accessibilityRole="header"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              {t.welcome}
            </Text>
            <Text className="text-base text-muted-foreground">
              {t.welcomeDetail}
            </Text>
          </View>
          <View className="gap-5 rounded-3xl bg-surface p-6 sm:p-8">
            <Text className="text-xs font-bold tracking-widest text-primary">
              {t.yourNextStep}
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              {selected.length ? t.continueLearning : t.startLearning}
            </Text>
            {!selection ? (
              <Text className="text-base text-muted-foreground">
                {t.loading}
              </Text>
            ) : (
              <>
                <Text className="text-4xl leading-normal tracking-widest text-foreground">
                  {selected.length
                    ? selected
                        .slice(0, 5)
                        .map((card) => card.kana)
                        .join(' ')
                    : 'あ い う え お'}
                </Text>
                <View className="gap-4 border-t border-border pt-5">
                  <Text className="text-sm text-muted-foreground">
                    {selected.length
                      ? t.selected(selected.length)
                      : t.startLearningDetail}
                  </Text>
                  <Action
                    primary
                    label={
                      selected.length ? t.resumeStudy : t.configurePractice
                    }
                    testID="home-start"
                    onPress={() =>
                      selected.length
                        ? router.navigate({
                            pathname: '/study',
                            params: {
                              kana: JSON.stringify(
                                selected.map((card) => card.id),
                              ),
                              mode: 'scheduled',
                            },
                          })
                        : router.navigate('/practice')
                    }
                  />
                  {selected.length ? (
                    <Action
                      label={t.changeSelection}
                      onPress={() => router.navigate('/practice')}
                    />
                  ) : null}
                </View>
              </>
            )}
            {notice ? (
              <Text accessibilityRole="alert" className="text-sm text-error">
                {notice}
              </Text>
            ) : null}
          </View>
          <View className="gap-4">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Text
                accessibilityRole="header"
                className="text-xl font-semibold text-foreground"
              >
                {t.exploreAlphabets}
              </Text>
              <Action
                label={t.viewSyllabary}
                onPress={() => router.navigate('/syllabary')}
              />
            </View>
            {progress.data ? (
              <AlphabetCoverage data={progress.data} />
            ) : (
              <ProgressNotice
                status={progress.status}
                onRetry={progress.refresh}
              />
            )}
          </View>
          {progress.data ? <DueReview data={progress.data} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
