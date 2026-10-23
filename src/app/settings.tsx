import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Divider, Section, TextAction } from '@/components/game/layout';
import { Segment } from '@/components/game/segment';
import { PageHeading } from '@/components/page-heading';
import { Screen } from '@/components/screen';
import { ResetProgress } from '@/components/reset-progress';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { setSoundEnabled, useSoundEnabled } from '@/lib/sounds';
import { defaultSelection } from '@/lib/selection-storage';

export default function SettingsScreen() {
  const { preferences, updatePreferences, t } = usePreferences();
  const { selection, updateSelection, notice } = useSelection();
  const sound = useSoundEnabled();
  // The selection before a reset, kept so the learner can undo it.
  const [previous, setPrevious] = useState<typeof selection>(null);
  return (
    <Screen navigation tabs={false} title={t.settings}>
      <ScrollView contentContainerClassName="items-center">
        <View className="w-full max-w-2xl gap-6 px-4 pt-1 pb-8 sm:px-6 sm:py-10">
          <PageHeading title={t.settings} />
          <Section label={t.appearance}>
            <Text className="font-ui text-[13px] text-muted-foreground">
              {t.appearanceDetail}
            </Text>
            <Segment
              block
              label={t.appearance}
              value={preferences.theme}
              onChange={(theme) => updatePreferences({ theme })}
              options={(['light', 'dark'] as const).map((theme) => ({
                value: theme,
                label: t[theme],
                testID: `theme-${theme}`,
              }))}
            />
          </Section>
          <Divider />
          <Section label={t.language}>
            <Text className="font-ui text-[13px] text-muted-foreground">
              {t.languageDetail}
            </Text>
            <Segment
              block
              label={t.language}
              value={preferences.language}
              onChange={(language) => updatePreferences({ language })}
              options={[
                { value: 'es', label: 'Español', testID: 'language-es' },
                { value: 'en', label: 'English', testID: 'language-en' },
              ]}
            />
          </Section>
          <Divider />
          <Section label={t.sound}>
            <Text className="font-ui text-[13px] text-muted-foreground">
              {t.soundDetail}
            </Text>
            <Segment
              block
              label={t.sound}
              value={sound ? 'on' : 'off'}
              onChange={(value) => setSoundEnabled(value === 'on')}
              options={[
                { value: 'on', label: t.soundOn, testID: 'sound-on' },
                { value: 'off', label: t.soundOff, testID: 'sound-off' },
              ]}
            />
          </Section>
          <Divider />
          <Section label={t.deviceData}>
            <Text className="font-ui text-[13px] leading-5 text-muted-foreground">
              {t.dataDetail}
            </Text>
            <View className="items-start">
              <Action
                variant="quiet"
                label={t.reset}
                disabled={!selection}
                onPress={() => {
                  setPrevious(selection);
                  updateSelection(() => defaultSelection);
                }}
              />
            </View>
            <Text
              accessibilityLiveRegion="polite"
              className="font-ui text-[13px] text-muted-foreground"
            >
              {previous ? t.resetDone : t.resetDetail}
            </Text>
            {previous ? (
              <TextAction
                label={t.undo}
                testID="undo-reset"
                onPress={() => {
                  updateSelection(() => previous);
                  setPrevious(null);
                }}
              />
            ) : null}
            {notice ? (
              <Text
                accessibilityRole="alert"
                className="font-ui text-[13px] text-error"
              >
                {notice}
              </Text>
            ) : null}
          </Section>
          <Divider />
          <ResetProgress />
        </View>
      </ScrollView>
    </Screen>
  );
}
