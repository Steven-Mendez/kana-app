import { Link, router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AccountPanel } from '@/components/account-panel';
import { Action } from '@/components/action';
import { ScreenTitle } from '@/components/game/comic';
import { Flame } from '@/components/game/flame';
import {
  Divider,
  InlineStat,
  Section,
  Skeleton,
} from '@/components/game/layout';
import { Meter } from '@/components/game/meter';
import { Icon } from '@/components/icon';
import { LegalLinks } from '@/components/legal-links';
import { ProgressNotice } from '@/components/progress-overview';
import { Screen } from '@/components/screen';
import { alphabetLabels, cards } from '@/data/kana';
import { useAuth } from '@/lib/auth-provider';
import { dailyStreak } from '@/lib/game-streak';
import { useLearning } from '@/lib/learning-provider';
import { usePreferences } from '@/lib/preferences-provider';
import { pressHaptic } from '@/lib/haptics';
import { useStudyProgress } from '@/lib/use-study-progress';

/** Who is studying and what the saved reviews add up to. */
export default function ProfileScreen() {
  const { t, preferences } = usePreferences();
  const { account } = useAuth();
  const { document } = useLearning();
  const progress = useStudyProgress();
  const data = progress.data;
  const streak = dailyStreak(document.events);
  const { width } = useWindowDimensions();
  return (
    <Screen navigation>
      <ScrollView contentContainerClassName="items-center">
        <View className="w-full max-w-2xl gap-6 px-4 pt-1 pb-8 sm:px-6 sm:py-10">
          {width >= 768 ? <ScreenTitle>{t.profile}</ScreenTitle> : null}
          <View className="flex-row items-center gap-4">
            {/* The fox already sits in the app bar: the learner gets a plain
                initial (or a person glyph as a guest) instead. */}
            <View
              accessible={false}
              className="size-14 items-center justify-center rounded-full bg-muted"
            >
              {account ? (
                <Text className="font-ui-bold text-xl text-muted-foreground uppercase">
                  {(account.name || account.email || '?').slice(0, 1)}
                </Text>
              ) : (
                <Icon
                  name={{
                    ios: 'person.fill',
                    android: 'person',
                    web: 'person',
                  }}
                  color="muted-foreground"
                  size={26}
                />
              )}
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text
                numberOfLines={2}
                className="font-display text-xl text-foreground"
              >
                {account ? account.name || account.email : t.guest}
              </Text>
              <Text className="font-ui text-[13px] text-muted-foreground">
                {account ? t.tagline : t.guestDetail}
              </Text>
            </View>
            <Link href="/settings" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={t.settings}
                testID="nav-settings"
                hitSlop={4}
                onPressIn={pressHaptic}
                className="size-11 items-center justify-center rounded-full active:opacity-60 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon
                  name={{
                    ios: 'gearshape.fill',
                    android: 'settings',
                    web: 'settings',
                  }}
                  color="muted-foreground"
                />
              </Pressable>
            </Link>
          </View>
          {data?.reviewed === 0 ? (
            // A new learner gets one next step instead of a page of zeros.
            <View className="gap-4">
              <View className="gap-1">
                <Text className="font-ui-bold text-lg text-foreground">
                  {t.noProgress}
                </Text>
                <Text className="font-ui text-[15px] text-muted-foreground">
                  {t.noProgressDetail}
                </Text>
              </View>
              <Action
                primary
                label={t.startPracticing}
                onPress={() => router.navigate('/')}
              />
            </View>
          ) : data ? (
            <>
              <Section label={t.statistics}>
                <View className="flex-row flex-wrap gap-y-5">
                  <InlineStat
                    className="w-1/2 pr-2"
                    value={streak.days}
                    label={t.streakStat}
                    icon={
                      <Flame
                        tone={streak.days ? 'streak' : 'off'}
                        size={26}
                        live
                      />
                    }
                  />
                  <InlineStat
                    className="w-1/2 pr-2"
                    value={data.reviewed}
                    label={`${t.reviewedKana} / ${cards.length}`}
                    icon={
                      <Text
                        lang="ja"
                        className="font-kana text-2xl text-muted-foreground"
                      >
                        あ
                      </Text>
                    }
                  />
                  <InlineStat
                    className="w-1/2 pr-2"
                    value={data.today}
                    label={t.reviewedToday}
                    icon={
                      <Icon
                        name={{
                          ios: 'sun.max.fill',
                          android: 'light_mode',
                          web: 'light_mode',
                        }}
                        color="muted-foreground"
                        size={24}
                      />
                    }
                  />
                  <InlineStat
                    className="w-1/2 pr-2"
                    value={data.reviews}
                    label={t.savedReviews}
                    icon={
                      <Icon
                        name={{
                          ios: 'checkmark.seal.fill',
                          android: 'verified',
                          web: 'verified',
                        }}
                        color="success"
                        size={24}
                      />
                    }
                  />
                </View>
              </Section>
              <Divider />
              <Section label={t.alphabets}>
                {data.alphabets.map(({ alphabet, reviewed, total }) => (
                  <View key={alphabet} className="gap-2">
                    <View className="flex-row items-center gap-3">
                      <Text
                        lang="ja"
                        className="w-8 font-kana text-2xl text-muted-foreground"
                      >
                        {alphabet === 'hiragana' ? 'あ' : 'ア'}
                      </Text>
                      <View className="min-w-0 flex-1">
                        <Text className="font-ui-bold text-base text-foreground">
                          {alphabetLabels[alphabet]}
                        </Text>
                        <Text className="font-ui text-[13px] text-muted-foreground">
                          {t.coverage(reviewed, total)}
                        </Text>
                      </View>
                      <Text className="font-ui-bold text-lg text-foreground tabular-nums">
                        {Math.round((reviewed / total) * 100)}%
                      </Text>
                    </View>
                    <Meter
                      value={reviewed}
                      total={total}
                      label={alphabetLabels[alphabet]}
                    />
                  </View>
                ))}
                <Text className="font-ui text-[13px] text-muted-foreground">
                  {t.coverageDetail}
                </Text>
              </Section>
              <Divider />
              <Section label={t.memoryStages}>
                {(['unseen', 'learning', 'mastered'] as const).map((stage) => (
                  <View key={stage} className="gap-2">
                    <View className="flex-row justify-between gap-3">
                      <Text className="flex-1 font-ui text-[15px] text-foreground">
                        {t[stage]}
                      </Text>
                      <Text className="font-ui-bold text-[15px] text-foreground tabular-nums">
                        {data[stage]}
                      </Text>
                    </View>
                    <Meter
                      value={data[stage]}
                      total={cards.length}
                      label={t[stage]}
                      tone={
                        stage === 'unseen'
                          ? 'neutral'
                          : stage === 'mastered'
                            ? 'success'
                            : 'primary'
                      }
                    />
                  </View>
                ))}
              </Section>
            </>
          ) : progress.status === 'loading' ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={t.loading}
              className="flex-row flex-wrap gap-y-5"
            >
              {[0, 1, 2, 3].map((key) => (
                <View key={key} className="w-1/2 flex-row gap-3 pr-2">
                  <Skeleton className="size-8 rounded-full" />
                  <View className="flex-1 gap-2">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-3 w-24" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ProgressNotice status="error" onRetry={progress.refresh} />
          )}
          <Divider />
          <AccountPanel />
          <Text className="text-center font-ui text-xs leading-5 text-muted-foreground">
            {t.progressLocalDetail}
          </Text>
          <LegalLinks language={preferences.language} />
        </View>
      </ScrollView>
    </Screen>
  );
}
