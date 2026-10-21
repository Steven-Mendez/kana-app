import type { PropsWithChildren } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { Link } from 'expo-router';
import { Brand } from '@/components/brand';
import { AccountLinks } from '@/components/account-links';
import { AppNavigation } from '@/components/app-navigation';
import { usePreferences } from '@/lib/preferences-provider';

export function Screen({
  children,
  navigation = false,
}: PropsWithChildren<{ navigation?: boolean }>) {
  const { width } = useWindowDimensions();
  const { notice } = usePreferences();
  const wide = width >= 768;
  const nativeTabs = navigation && process.env.EXPO_OS !== 'web';
  const native = process.env.EXPO_OS !== 'web';
  const Container = native ? SafeAreaView : View;
  return (
    <Container
      style={{ flex: 1 }}
      {...(native
        ? { edges: { top: !navigation, bottom: true, left: true, right: true } }
        : {})}
    >
      <View className="flex-1 bg-background web:pt-[env(safe-area-inset-top)] web:pr-[env(safe-area-inset-right)] web:pb-[env(safe-area-inset-bottom)] web:pl-[env(safe-area-inset-left)]">
        {navigation && !nativeTabs && wide ? <AppNavigation wide /> : null}
        {navigation && !nativeTabs && !wide ? (
          <View className="flex-row items-center justify-between border-b border-border px-5 py-2">
            <Link href="/" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Kana"
                className="min-h-11 justify-center active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Brand />
              </Pressable>
            </Link>
            <AccountLinks />
          </View>
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
        {navigation && !nativeTabs && !wide ? (
          <AppNavigation wide={false} />
        ) : null}
      </View>
    </Container>
  );
}
