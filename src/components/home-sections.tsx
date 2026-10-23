import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { GamePanel } from '@/components/game/game-panel';
import { GameButton } from '@/components/game/game-button';
import { Section, Skeleton, TextAction } from '@/components/game/layout';
import { Meter } from '@/components/game/meter';
import { Icon } from '@/components/icon';
import { Segment } from '@/components/game/segment';
import { alphabetLabels, type KanaCard } from '@/data/kana';
import type { topConfusion } from '@/lib/confusions';
import { duelLength } from '@/lib/game-score';
import { dailyGoal } from '@/lib/game-streak';
import { usePreferences } from '@/lib/preferences-provider';
import { dueStudyParams, type summarizeProgress } from '@/lib/study-progress';
import { cn } from '@/lib/utils';

type Progress = ReturnType<typeof summarizeProgress>;

/**
 * Today's round, the one raised panel on Home: the saved selection and a
 * finite or endless length. Start lives in the bottom bar (`HomeStart`).
 */
export function HomeRound({
  title,
  selected,
  ready,
  endless,
  onEndless,
  notice,
}: {
  title: string;
  selected: readonly KanaCard[];
  ready: boolean;
  endless: boolean;
  onEndless: (endless: boolean) => void;
  notice?: string;
}) {
  const { t } = usePreferences();
  return (
    <GamePanel caption={t.homeTodayRound}>
      <Text
        accessibilityRole="header"
        className="font-display text-2xl text-foreground"
      >
        {title}
      </Text>
      {!ready ? (
        <View accessibilityRole="progressbar" accessibilityLabel={t.loading}>
          <Skeleton className="h-12 w-3/4" />
        </View>
      ) : (
        <>
          <Text
            lang="ja"
            numberOfLines={1}
            className={cn(
              'font-kana text-[32px] leading-10 text-foreground',
              !selected.length && 'opacity-40',
            )}
          >
            {selected.length
              ? selected
                  .slice(0, 6)
                  .map((card) => card.kana)
                  .join('  ') + (selected.length > 6 ? '  …' : '')
              : 'あ い う え お'}
          </Text>
          <Text className="font-ui text-[13px] text-muted-foreground">
            {selected.length
              ? t.homeRoundMeta(selected.length, endless)
              : t.startLearningDetail}
          </Text>
          {selected.length ? (
            <Segment
              label={t.homeRoundLength}
              value={endless ? 'endless' : 'finite'}
              onChange={(value) => onEndless(value === 'endless')}
              options={[
                { value: 'finite', label: t.homeRoundFinite },
                { value: 'endless', label: t.homeRoundEndless },
              ]}
            />
          ) : null}
          {selected.length ? (
            <TextAction
              label={t.changeSelection}
              onPress={() => router.navigate('/kana')}
            />
          ) : null}
        </>
      )}
      {notice ? (
        <Text
          accessibilityRole="alert"
          className="font-ui text-[13px] text-error"
        >
          {notice}
        </Text>
      ) : null}
    </GamePanel>
  );
}

/** Home's primary action, full width in the thumb zone above the tabs. */
export function HomeStart({
  action,
  onStart,
}: {
  action: string;
  onStart: () => void;
}) {
  return (
    <View className="w-full max-w-2xl self-center px-4 pt-3 pb-2 sm:px-6">
      <GameButton block testID="home-start" onPress={onStart}>
        {action}
      </GameButton>
    </View>
  );
}

/** Kana whose review is due now, with the due-only round. */
export function HomeDue({ data }: { data: Progress }) {
  const { t, preferences } = usePreferences();
  return (
    <Section
      label={t.dueReview}
      trailing={
        <Text className="font-ui-bold text-[13px] text-tangerine-text">
          {t.pendingCount(data.due.length)}
        </Text>
      }
    >
      {data.due.length ? (
        <View className="gap-3">
          <View className="gap-1">
            <Text
              lang="ja"
              numberOfLines={1}
              className="font-kana text-2xl text-foreground"
            >
              {data.due
                .slice(0, 5)
                .map((card) => card.kana)
                .join('  ')}
            </Text>
            <Text className="font-ui text-[13px] text-muted-foreground">
              {t.dueDetail}
            </Text>
          </View>
          <GameButton
            variant="secondary"
            onPress={() =>
              router.navigate({
                pathname: '/study',
                params: dueStudyParams(data.due),
              })
            }
          >
            {t.reviewDue}
          </GameButton>
        </View>
      ) : (
        <View className="gap-1">
          <Text className="font-ui-bold text-base text-foreground">
            {data.reviewed ? t.allCaughtUp : t.noProgress}
          </Text>
          <Text className="font-ui text-[13px] text-muted-foreground">
            {data.reviewed ? t.allCaughtUpDetail : t.noProgressDetail}
          </Text>
          {data.next ? (
            <Text className="font-ui text-[13px] text-muted-foreground">
              {t.nextReview(data.next.toLocaleString(preferences.language))}
            </Text>
          ) : null}
        </View>
      )}
    </Section>
  );
}

/** Today's goal: a few kana reviewed, measured from saved reviews. */
export function HomeGoal({ today }: { today: number }) {
  const { t } = usePreferences();
  const done = today >= dailyGoal;
  return (
    <Section testID="home-goal" label={t.homeGoal}>
      <View className="flex-row items-center gap-3">
        <Icon
          name={{ ios: 'target', android: 'flag', web: 'flag' }}
          color={done ? 'success' : today ? 'foreground' : 'muted-foreground'}
          size={28}
        />
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-ui-bold text-base text-foreground">
            {t.homeGoalProgress(today, dailyGoal)}
          </Text>
          <Text className="font-ui text-[13px] text-muted-foreground">
            {done ? t.homeGoalDone : t.homeGoalTodo(dailyGoal - today)}
          </Text>
        </View>
      </View>
      <Meter
        value={Math.min(today, dailyGoal)}
        total={dailyGoal}
        label={t.homeGoal}
        tone="tangerine"
      />
    </Section>
  );
}

/** Both alphabets at a glance, leading to the Kana screen. */
export function HomeAlphabets({ data }: { data: Progress }) {
  const { t } = usePreferences();
  return (
    <Section
      testID="home-alphabets"
      label={t.alphabets}
      trailing={
        <TextAction
          label={t.viewSyllabary}
          onPress={() => router.navigate('/kana')}
        />
      }
    >
      {data.alphabets.map(({ alphabet, reviewed, total }) => (
        <View key={alphabet} className="gap-2">
          <View className="flex-row items-center gap-3">
            <Text
              lang="ja"
              className="w-8 font-kana text-2xl text-muted-foreground"
            >
              {alphabet === 'hiragana' ? 'あ' : 'ア'}
            </Text>
            <Text className="flex-1 font-ui-bold text-base text-foreground">
              {alphabetLabels[alphabet]}
            </Text>
            <Text className="font-ui text-[13px] text-muted-foreground tabular-nums">
              {reviewed} / {total}
            </Text>
          </View>
          <Meter
            value={reviewed}
            total={total}
            label={alphabetLabels[alphabet]}
          />
        </View>
      ))}
    </Section>
  );
}

/**
 * The most confused pair as a short free round; until there is one, a locked
 * line explains how a duel appears.
 */
export function HomeDuel({ pair }: { pair: ReturnType<typeof topConfusion> }) {
  const { t } = usePreferences();
  return (
    <Section testID="home-duel" label={t.homeDuel}>
      <View className="gap-3">
        <View className="flex-row items-center gap-4">
          <View
            accessible={false}
            className="flex-row items-baseline gap-2"
            style={pair ? undefined : { opacity: 0.4 }}
          >
            <Text lang="ja" className="font-kana text-2xl text-foreground">
              {pair ? pair.cards[0].kana : t.homeDuelUnknown}
            </Text>
            <Text className="font-ui-bold text-[13px] text-muted-foreground">
              {t.homeVs}
            </Text>
            <Text lang="ja" className="font-kana text-2xl text-foreground">
              {pair ? pair.cards[1].kana : t.homeDuelUnknown}
            </Text>
          </View>
          <Text
            numberOfLines={3}
            className="min-w-0 flex-1 font-ui text-[13px] text-muted-foreground"
          >
            {pair ? t.homeDuelDetail(pair.count) : t.homeDuelLocked}
          </Text>
          {pair ? null : (
            <Icon
              name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
              color="muted-foreground"
              size={20}
            />
          )}
        </View>
        {pair ? (
          <GameButton
            variant="secondary"
            testID="home-duel-start"
            onPress={() =>
              router.navigate({
                pathname: '/study',
                params: {
                  kana: JSON.stringify(pair.cards.map((card) => card.id)),
                  length: String(duelLength),
                },
              })
            }
          >
            {t.homeChallenge}
          </GameButton>
        ) : null}
      </View>
    </Section>
  );
}

/** Skeleton for the progress sections while saved reviews load. */
export function HomeSkeleton() {
  const { t } = usePreferences();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={t.loading}
      className="gap-8"
    >
      {[0, 1].map((key) => (
        <View key={key} className="gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3.5 w-full rounded-full" />
        </View>
      ))}
    </View>
  );
}
