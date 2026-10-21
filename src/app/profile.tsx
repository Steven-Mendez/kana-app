import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Brand } from '@/components/brand';
import { AccountPanel } from '@/components/account-panel';
import { useAuth } from '@/lib/auth-provider';
import { PageHeading } from '@/components/page-heading';
import { Screen } from '@/components/screen';
import { alphabetLabels, alphabets } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { selectedCards } from '@/lib/study';

export default function ProfileScreen() {
  const { t } = usePreferences();
  const { account } = useAuth();
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
              {account ? account.name || account.email : t.guest}
            </Text>
            <Text className="text-base leading-7 text-muted-foreground">
              {account ? t.tagline : t.guestDetail}
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
            {!account ? (
              <Text className="text-sm text-muted-foreground">
                {t.localOnly}
              </Text>
            ) : null}
            {notice ? (
              <Text accessibilityRole="alert" className="text-sm text-error">
                {notice}
              </Text>
            ) : null}
          </View>
          <AccountPanel />
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
