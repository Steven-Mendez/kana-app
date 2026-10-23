import type { PropsWithChildren } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import {
  AppHeader,
  AppNavigation,
  BackButton,
} from '@/components/app-navigation';
import { usePreferences } from '@/lib/preferences-provider';

export function Screen({
  children,
  navigation = false,
  tabs = true,
  brand = false,
  title,
}: PropsWithChildren<{
  navigation?: boolean;
  /** Pushed secondary screens hide the tab bar. */
  tabs?: boolean;
  /**
   * Home only: the phone app bar with the fox logo and the streak. Other
   * screens show just their title (and back, when pushed) above the content.
   */
  brand?: boolean;
  /** The screen name, shown as a large title on phones. */
  title?: string;
}>) {
  const { width } = useWindowDimensions();
  const { notice } = usePreferences();
  const wide = width >= 768;
  const native = process.env.EXPO_OS !== 'web';
  const Container = native ? SafeAreaView : View;
  return (
    <Container
      style={{ flex: 1 }}
      {...(native
        ? { edges: { top: true, bottom: true, left: true, right: true } }
        : {})}
    >
      <View className="flex-1 bg-background web:pt-[env(safe-area-inset-top)] web:pr-[env(safe-area-inset-right)] web:pb-[env(safe-area-inset-bottom)] web:pl-[env(safe-area-inset-left)]">
        {navigation && wide ? <AppNavigation wide /> : null}
        {navigation && !wide ? (
          brand ? (
            <AppHeader />
          ) : (
            <ScreenHeading title={title} />
          )
        ) : null}
        {notice ? (
          <Text
            accessibilityRole="alert"
            className="px-4 py-2 text-sm text-error"
          >
            {notice}
          </Text>
        ) : null}
        <View className="min-h-0 flex-1">{children}</View>
        {navigation && tabs && !wide ? <AppNavigation wide={false} /> : null}
      </View>
    </Container>
  );
}

/** A phone page title with back on pushed screens; no logo, no streak. */
function ScreenHeading({ title }: { title?: string }) {
  return (
    <View className="flex-row items-center gap-3 px-4 pt-4 pb-2">
      <BackButton />
      {title ? (
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="min-w-0 flex-1 font-ui-bold text-[28px] leading-9 text-foreground"
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}
