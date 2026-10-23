import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Burst } from '@/components/game/burst';
import { Flame } from '@/components/game/flame';
import { durations, easeOut, springs } from '@/lib/motion';
import { usePreferences } from '@/lib/preferences-provider';
import { cn } from '@/lib/utils';

export type StreakState = 'active' | 'at-risk' | 'off' | 'milestone';

/**
 * Days played in a row, with a flame. Callers pass real streak data only.
 * `ignite` celebrates a streak just kept: the flame pops in, throws sparks and
 * the count bumps, after `delay` ms.
 */
export function StreakBadge({
  days,
  state,
  ignite = false,
  delay = 0,
  onPress,
  testID,
}: {
  days: number;
  state: StreakState;
  ignite?: boolean;
  delay?: number;
  onPress?: () => void;
  testID?: string;
}) {
  const { t } = usePreferences();
  const reduced = useReducedMotion();
  const igniting = ignite && !reduced;
  const flicker = useSharedValue(0);
  const flare = useSharedValue(igniting ? 0 : 1);
  const bump = useSharedValue(1);
  useEffect(() => {
    if (state !== 'at-risk' || reduced) {
      flicker.set(0);
      return;
    }
    flicker.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [state, reduced, flicker]);
  useEffect(() => {
    if (!igniting) return;
    flare.set(withDelay(delay, withSpring(1, springs.pop)));
    bump.set(
      withDelay(
        delay + 160,
        withSequence(
          withTiming(1.35, { duration: durations.tap, easing: easeOut }),
          withSpring(1, springs.pop),
        ),
      ),
    );
  }, [igniting, delay, flare, bump]);
  const flameStyle = useAnimatedStyle(() => ({
    opacity: (1 - 0.45 * flicker.get()) * Math.min(1, flare.get() * 2),
    transform: [{ scale: 0.6 + 0.4 * flare.get() }],
  }));
  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bump.get() }],
  }));

  const label =
    state === 'at-risk'
      ? `${t.streakDays(days)}, ${t.streakAtRisk}`
      : t.streakDays(days);
  const content = (
    <View
      className={cn(
        'h-10 flex-row items-center gap-1.5 self-start rounded-full border-2 pl-2 pr-3.5',
        state === 'milestone'
          ? 'border-tangerine-lip bg-tangerine'
          : 'border-line bg-card',
        state === 'at-risk' && 'border-dashed',
      )}
      style={state === 'milestone' ? { marginBottom: 4 } : undefined}
    >
      <View>
        {igniting ? <Burst delay={delay + 80} /> : null}
        <Animated.View style={flameStyle}>
          <Flame
            tone={
              state === 'off'
                ? 'off'
                : state === 'at-risk'
                  ? 'pending'
                  : 'streak'
            }
            size={24}
            live={state === 'active' || state === 'milestone'}
          />
        </Animated.View>
      </View>
      <Animated.View style={countStyle}>
        <Text
          className={cn(
            'font-display text-xl tabular-nums',
            state === 'off'
              ? 'text-muted-foreground'
              : state === 'milestone'
                ? 'text-on-bright'
                : 'text-tangerine-text',
          )}
        >
          {days}
        </Text>
      </Animated.View>
      {state === 'at-risk' ? (
        <Text className="font-ui-bold text-xs text-foreground">
          {t.streakToday}
        </Text>
      ) : null}
    </View>
  );
  const milestoneEdge =
    state === 'milestone' ? (
      <View className="absolute inset-x-0 bottom-0 top-1 rounded-full bg-tangerine-lip" />
    ) : null;

  if (!onPress)
    return (
      <View
        testID={testID}
        accessible
        accessibilityRole="text"
        accessibilityLabel={label}
        className="self-start"
      >
        {milestoneEdge}
        {content}
      </View>
    );
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="self-start rounded-full focus-visible:outline-[3px] focus-visible:outline-ring"
    >
      {milestoneEdge}
      {content}
    </Pressable>
  );
}
