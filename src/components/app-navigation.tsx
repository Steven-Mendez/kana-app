import { Link, router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { usePreferences } from '@/lib/preferences-provider';
import { Brand } from '@/components/brand';
import { StreakBadge } from '@/components/game/streak-badge';
import { TabIcon } from '@/components/game/tab-icons';
import { Icon } from '@/components/icon';
import { dailyStreak } from '@/lib/game-streak';
import { useLearning } from '@/lib/learning-provider';
import { cn } from '@/lib/utils';

const primaryPaths = ['/', '/kana', '/profile'];

/**
 * Back for secondary screens (Settings, sign-in). Reading the stack during
 * render gives stale focus, so a screen opened directly falls back to Home
 * on press instead. The native back gesture keeps working too.
 */
export function BackButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = usePreferences();
  if (primaryPaths.includes(pathname)) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.back}
      testID="nav-back"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      className={cn(
        'h-11 w-11 items-center justify-center self-start rounded-full bg-muted active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring',
        className,
      )}
    >
      <Icon
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        size={18}
      />
    </Pressable>
  );
}

/**
 * Home's phone app bar: the fox logo with the app name and the daily streak
 * from saved reviews. Other screens show only their title.
 */
export function AppHeader() {
  const { document } = useLearning();
  const streak = dailyStreak(document.events);
  return (
    <View className="flex-row items-center gap-3 px-4 pt-2 pb-3">
      <View className="min-w-0 flex-1">
        <Brand />
      </View>
      <StreakBadge
        testID="header-streak"
        days={streak.days}
        state={streak.state}
      />
    </View>
  );
}

/**
 * The arcade navigation, drawn by the app on every platform: an icon-only
 * bottom bar on phones and a top bar with labels from 768px. Each tab has its
 * own soft-ink icon; the selected one turns primary over a short bar, so it
 * reads without colour.
 */
export function AppNavigation({ wide }: { wide: boolean }) {
  const pathname = usePathname();
  const { t } = usePreferences();
  const destinations = [
    { href: '/', label: t.home, icon: 'home' },
    { href: '/kana', label: t.kana, icon: 'kana' },
    { href: '/profile', label: t.profile, icon: 'profile' },
  ] as const;
  return (
    <View
      className={cn(
        'border-line bg-background',
        wide ? 'border-b-2 px-6' : 'border-t-2 px-2 py-2',
      )}
    >
      <View className="w-full max-w-4xl flex-row items-center justify-between self-center">
        {wide ? (
          <View className="flex-row items-center gap-3">
            <BackButton />
            <Link href="/" asChild>
              <Pressable
                accessibilityLabel="Kana"
                className="min-h-16 flex-row items-center gap-3 py-3 pr-6 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Brand />
              </Pressable>
            </Link>
          </View>
        ) : null}
        <View className={wide ? 'flex-row gap-2 py-2' : 'flex-1 flex-row'}>
          {destinations.map(({ href, label, icon }) => {
            const selected = pathname === href;
            return (
              <Link key={href} href={href} asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={label}
                  accessibilityState={{ selected }}
                  aria-current={selected ? 'page' : undefined}
                  testID={`nav-${href === '/' ? 'home' : href.slice(1)}`}
                  className={cn(
                    'items-center rounded-xl focus-visible:outline-2 focus-visible:outline-ring active:scale-95',
                    !wide && 'flex-1',
                  )}
                >
                  <View
                    className={cn(
                      'h-12 flex-row items-center justify-center gap-2',
                      wide ? 'px-3' : 'w-13',
                    )}
                  >
                    <TabIcon
                      name={icon}
                      selected={selected}
                      size={wide ? 24 : 30}
                    />
                    {wide ? (
                      <Text
                        numberOfLines={1}
                        className={cn(
                          'font-display text-xs uppercase',
                          selected ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {label}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    className={cn(
                      'h-1 w-5 rounded-full',
                      selected ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
    </View>
  );
}
