import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Brand } from '@/components/brand';
import { PageHeading } from '@/components/page-heading';
import { Screen } from '@/components/screen';
import { alphabetLabels, alphabets } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { selectedCards } from '@/lib/study';

export default function ProfileScreen() {
  const { t } = usePreferences();
  const { selection, notice } = useSelection();
  const cards = selection ? selectedCards(selection.kanaIds) : [];
  return (
    <Screen navigation>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="items-center"
      >
        <View className="w-full max-w-2xl gap-8 px-4 py-6 sm:px-6 sm:py-10">
          <PageHeading title={t.profile} description={t.tagline} />
          <View className="gap-4">
            <Brand />
            <Text className="text-xl font-semibold text-foreground">
              {t.guest}
            </Text>
            <Text className="text-base leading-7 text-muted-foreground">
              {t.guestDetail}
            </Text>
          </View>
          <View className="gap-4 rounded-2xl border border-border bg-surface p-5">
            <Text
              accessibilityRole="header"
              className="text-lg font-semibold text-foreground"
            >
              {t.yourSelection}
            </Text>
            {selection ? (
              <View className="flex-row flex-wrap gap-8">
                {alphabets.map((alphabet) => (
                  <View key={alphabet} className="gap-1">
                    <Text className="text-3xl font-semibold text-foreground">
                      {
                        cards.filter((card) => card.alphabet === alphabet)
                          .length
                      }
                      <Text className="text-base text-muted-foreground">
                        {' '}
                        / 107
                      </Text>
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {alphabetLabels[alphabet]}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-base text-foreground">{t.loading}</Text>
            )}
            <Text className="text-sm text-muted-foreground">{t.localOnly}</Text>
            {notice ? (
              <Text accessibilityRole="alert" className="text-sm text-error">
                {notice}
              </Text>
            ) : null}
          </View>
          <View className="gap-3 rounded-2xl border border-border bg-surface p-5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Text
                accessibilityRole="header"
                className="text-lg font-semibold text-foreground"
              >
                {t.account}
              </Text>
              <Text className="rounded-lg bg-muted px-3 py-1 text-sm text-foreground">
                {t.soon}
              </Text>
            </View>
            <Text className="text-sm leading-6 text-muted-foreground">
              {t.accountDetail}
            </Text>
            <Action label={t.signIn} disabled />
          </View>
          <Action
            label={t.practiceNow}
            primary
            onPress={() => router.navigate('/practice')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
