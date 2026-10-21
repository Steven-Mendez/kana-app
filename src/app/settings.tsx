import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Action } from '@/components/action';
import { PageHeading } from '@/components/page-heading';
import { Screen } from '@/components/screen';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { defaultSelection } from '@/lib/selection-storage';

export default function SettingsScreen() {
  const { preferences, updatePreferences, t } = usePreferences();
  const { selection, updateSelection, notice } = useSelection();
  const [reset, setReset] = useState(false);
  return (
    <Screen navigation>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="items-center"
      >
        <View className="w-full max-w-2xl gap-8 px-4 py-6 sm:px-6 sm:py-10">
          <PageHeading title={t.settings} description={t.settingsDetail} />
          <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            <Text
              accessibilityRole="header"
              className="text-lg font-semibold text-foreground"
            >
              {t.appearance}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {t.appearanceDetail}
            </Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t.appearance}
              className="flex-row gap-3"
            >
              {(['light', 'dark'] as const).map((theme) => (
                <Pressable
                  key={theme}
                  accessibilityRole="radio"
                  aria-checked={preferences.theme === theme}
                  onPress={() => updatePreferences({ theme })}
                  testID={`theme-${theme}`}
                  className={`min-h-14 flex-1 flex-row flex-wrap items-center justify-center gap-2 rounded-lg border px-4 py-4 focus-visible:outline-2 focus-visible:outline-ring ${preferences.theme === theme ? 'border-primary bg-accent' : 'border-border'}`}
                >
                  <Text className="text-base text-foreground">{t[theme]}</Text>
                  {preferences.theme === theme ? (
                    <Text className="text-primary">✓</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
          <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            <Text
              accessibilityRole="header"
              className="text-lg font-semibold text-foreground"
            >
              {t.language}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {t.languageDetail}
            </Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t.language}
              className="flex-row gap-3"
            >
              {(['es', 'en'] as const).map((language) => (
                <Pressable
                  key={language}
                  accessibilityRole="radio"
                  aria-checked={preferences.language === language}
                  onPress={() => updatePreferences({ language })}
                  testID={`language-${language}`}
                  className={`min-h-14 flex-1 flex-row flex-wrap items-center justify-center gap-2 rounded-lg border px-4 py-4 focus-visible:outline-2 focus-visible:outline-ring ${preferences.language === language ? 'border-primary bg-accent' : 'border-border'}`}
                >
                  <Text className="text-base text-foreground">
                    {language === 'es' ? 'Español' : 'English'}
                  </Text>
                  {preferences.language === language ? (
                    <Text className="text-primary">✓</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
          <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            <Text
              accessibilityRole="header"
              className="text-lg font-semibold text-foreground"
            >
              {t.deviceData}
            </Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              {t.dataDetail}
            </Text>
            <View className="items-start">
              <Action
                label={t.reset}
                disabled={!selection}
                onPress={() => {
                  updateSelection(() => defaultSelection);
                  setReset(true);
                }}
              />
            </View>
            <Text
              accessibilityLiveRegion="polite"
              className="text-sm text-muted-foreground"
            >
              {reset ? t.resetDone : t.resetDetail}
            </Text>
            {notice ? (
              <Text accessibilityRole="alert" className="text-sm text-error">
                {notice}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
