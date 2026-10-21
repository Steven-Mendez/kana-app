import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icon';
import { usePreferences } from '@/lib/preferences-provider';

export function AccountLinks() {
  const { t } = usePreferences();
  return (
    <View className="flex-row gap-1">
      <Link href="/settings" asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t.settings}
          testID="nav-settings"
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Icon
            name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
          />
        </Pressable>
      </Link>
      <Link href="/profile" asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t.profile}
          testID="nav-profile"
          className="h-11 w-11 items-center justify-center rounded-full bg-muted active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Icon
            name={{
              ios: 'person.crop.circle',
              android: 'account_circle',
              web: 'account_circle',
            }}
          />
        </Pressable>
      </Link>
    </View>
  );
}
