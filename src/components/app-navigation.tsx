import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { usePreferences } from '@/lib/preferences-provider';
import { Brand } from '@/components/brand';
import { AccountLinks } from '@/components/account-links';
import { Icon } from '@/components/icon';

export function AppNavigation({ wide }: { wide: boolean }) {
  const pathname = usePathname();
  const { t } = usePreferences();
  const destinations = [
    { href: '/', label: t.home, icon: 'home' },
    { href: '/syllabary', label: t.syllabary, icon: 'grid_view' },
    { href: '/practice', label: t.practice, icon: 'style' },
    { href: '/progress', label: t.progress, icon: 'bar_chart' },
  ] as const;
  return (
    <View
      className={
        wide ? 'border-b border-border px-6' : 'border-t border-border px-4'
      }
    >
      <View className="w-full max-w-4xl flex-row items-center justify-between self-center">
        {wide ? (
          <Link href="/" asChild>
            <Pressable
              accessibilityLabel="Kana"
              className="min-h-16 flex-row items-center gap-3 py-3 pr-6 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Brand />
            </Pressable>
          </Link>
        ) : null}
        <View className={wide ? 'flex-row gap-2' : 'flex-1 flex-row'}>
          {destinations.map(({ href, label, icon }) => (
            <Link key={href} href={href} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityState={{ selected: pathname === href }}
                aria-current={pathname === href ? 'page' : undefined}
                testID={`nav-${href === '/' ? 'home' : href.slice(1)}`}
                className={`min-h-14 items-center justify-center gap-1 border-b-2 py-3 active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring ${wide ? 'flex-row gap-2 px-3' : 'flex-1 px-1'} ${pathname === href ? 'border-primary' : 'border-transparent'}`}
              >
                <Icon
                  name={{ web: icon }}
                  color={pathname === href ? 'primary' : 'muted-foreground'}
                />
                <Text
                  className={`max-w-full text-center text-xs font-semibold sm:text-sm ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {label}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
        {wide ? <AccountLinks /> : null}
      </View>
    </View>
  );
}
