import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Divider } from '@/components/game/layout';
import { Rise } from '@/components/game/rise';
import {
  HomeAlphabets,
  HomeDue,
  HomeDuel,
  HomeGoal,
  HomeRound,
  HomeSkeleton,
  HomeStart,
} from '@/components/home-sections';
import { ProgressNotice } from '@/components/progress-overview';
import { Screen } from '@/components/screen';
import { topConfusion } from '@/lib/confusions';
import { roundLength } from '@/lib/game-score';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { selectedCards } from '@/lib/study';
import { useConfusions } from '@/lib/use-confusions';
import { useStudyProgress } from '@/lib/use-study-progress';

type Copy = ReturnType<typeof usePreferences>['t'];

// Until progress loads, keep the returning wording rather than flash first use.
function nextStepCopy(t: Copy, selected: number, reviewed?: number) {
  if (!selected) return { title: t.startLearning, action: t.configurePractice };
  if (reviewed === 0)
    return { title: t.firstPractice, action: t.startPracticing };
  return { title: t.continueLearning, action: t.resumeStudy };
}

export default function HomeScreen() {
  const { t } = usePreferences();
  const { selection, notice } = useSelection();
  const progress = useStudyProgress();
  const { confusions } = useConfusions();
  const [endless, setEndless] = useState(false);
  const selected = selection ? selectedCards(selection.kanaIds) : [];
  const nextStep = nextStepCopy(t, selected.length, progress.data?.reviewed);
  const start = () =>
    selected.length
      ? router.navigate({
          pathname: '/study',
          params: {
            kana: JSON.stringify(selected.map((card) => card.id)),
            mode: 'scheduled',
            ...(endless ? {} : { length: String(roundLength) }),
          },
        })
      : router.navigate('/kana');
  return (
    <Screen navigation brand>
      <ScrollView contentContainerClassName="items-center">
        <View className="w-full max-w-2xl gap-6 px-4 pt-1 pb-8 sm:px-6 sm:py-10">
          <Text
            numberOfLines={2}
            className="font-ui text-[15px] text-muted-foreground"
          >
            <Text className="font-ui-bold text-foreground">{t.welcome}</Text>{' '}
            {t.welcomeDetail}
          </Text>
          <Rise>
            <HomeRound
              title={nextStep.title}
              selected={selected}
              ready={!!selection}
              endless={endless}
              onEndless={setEndless}
              notice={notice || undefined}
            />
          </Rise>
          {progress.data ? (
            // Sections rise once, in reading order, when progress arrives.
            <>
              <Rise index={1} className="gap-6">
                <HomeGoal today={progress.data.today} />
                <Divider />
              </Rise>
              {progress.data.reviewed ? (
                <Rise index={2} className="gap-6">
                  <HomeDue data={progress.data} />
                  <Divider />
                </Rise>
              ) : null}
              <Rise index={3} className="gap-6">
                <HomeDuel pair={topConfusion(confusions)} />
                <Divider />
              </Rise>
              <Rise index={4}>
                <HomeAlphabets data={progress.data} />
              </Rise>
            </>
          ) : progress.status === 'loading' ? (
            <HomeSkeleton />
          ) : (
            <ProgressNotice status="error" onRetry={progress.refresh} />
          )}
        </View>
      </ScrollView>
      <HomeStart action={nextStep.action} onStart={start} />
    </Screen>
  );
}
