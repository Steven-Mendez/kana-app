import { Slot } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { useCSSVariable } from 'uniwind';

import { usePreferences } from '@/lib/preferences-provider';

export default function TabsLayout() {
  const { t } = usePreferences();
  const [primary, muted, surface] = useCSSVariable([
    '--color-primary',
    '--color-muted-foreground',
    '--color-surface',
  ]);
  const selectedColor = typeof primary === 'string' ? primary : undefined;
  const defaultColor = typeof muted === 'string' ? muted : undefined;
  if (process.env.EXPO_OS === 'web') return <Slot />;
  return (
    <NativeTabs
      tintColor={selectedColor}
      iconColor={{ default: defaultColor, selected: selectedColor }}
      labelStyle={{
        default: { color: defaultColor },
        selected: { color: selectedColor },
      }}
      backgroundColor={typeof surface === 'string' ? surface : undefined}
    >
      <NativeTabs.Trigger
        name="index"
        testID="nav-home"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
        <NativeTabs.Trigger.Label>{t.home}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="syllabary"
        testID="nav-syllabary"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
        <NativeTabs.Trigger.Label>{t.syllabary}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="practice"
        testID="nav-practice"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'rectangle.on.rectangle',
            selected: 'rectangle.fill.on.rectangle.fill',
          }}
          md="style"
        />
        <NativeTabs.Trigger.Label>{t.practice}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="progress"
        testID="nav-progress"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon sf="chart.bar" md="bar_chart" />
        <NativeTabs.Trigger.Label>{t.progress}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
