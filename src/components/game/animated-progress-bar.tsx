import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

import { Flame } from '@/components/game/flame';
import { Progress } from '@/components/ui/progress';
import { kitsunebiCount } from '@/lib/game-combo';
import { usePreferences } from '@/lib/preferences-provider';

/** Round progress in an outlined capsule; the combo lights kitsunebi at its head. */
export function AnimatedProgressBar({
  value,
  combo,
  onQuit,
  quitLabel,
  quitTestID,
}: {
  value: number;
  combo: number;
  onQuit: () => void;
  quitLabel?: string;
  quitTestID?: string;
}) {
  const { t } = usePreferences();
  const reduced = useReducedMotion();
  // A round only moves forward: misses and skips never pull the bar back.
  const clamped = Math.min(1, Math.max(0, value));
  const [highest, setHighest] = useState(clamped);
  if (clamped > highest) setHighest(clamped);
  const percent = Math.round(Math.max(highest, clamped) * 100);

  const head = useSharedValue(percent);
  useEffect(() => {
    head.set(
      reduced
        ? percent
        : withSpring(percent, { duration: 420, dampingRatio: 0.75 }),
    );
  }, [percent, reduced, head]);
  const headStyle = useAnimatedStyle(() => ({ left: `${head.get()}%` }));

  const flames = kitsunebiCount(combo);
  return (
    <View className="w-full flex-row items-center gap-3">
      <CloseButton label={quitLabel} testID={quitTestID} onPress={onQuit} />
      <View className="relative flex-1">
        <Progress
          value={percent}
          aria-label={t.gameProgress}
          className="h-4 rounded-full bg-muted"
          indicatorClassName="rounded-full bg-tangerine"
        />
        {flames > 0 ? (
          <Animated.View
            pointerEvents="none"
            accessible={false}
            className="absolute -top-5 -ml-3.5 flex-row"
            style={headStyle}
          >
            {Array.from({ length: flames }, (_, index) => (
              <Wisp key={index} delay={index * 200} reduced={reduced} />
            ))}
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

/** The round's close (×) action: 44pt, with a visible pressed state. */
export function CloseButton({
  label,
  testID,
  onPress,
}: {
  label?: string;
  testID?: string;
  onPress: () => void;
}) {
  const { t } = usePreferences();
  const [muted] = useCSSVariable(['--color-muted-foreground']);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? t.gameQuit}
      testID={testID}
      hitSlop={4}
      onPress={onPress}
      className="size-11 items-center justify-center rounded-full active:bg-muted focus-visible:outline-[3px] focus-visible:outline-ring"
    >
      <Svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
        <Path
          d="M3 3l12 12M15 3L3 15"
          stroke={typeof muted === 'string' ? muted : undefined}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </Svg>
    </Pressable>
  );
}

function Wisp({ delay, reduced }: { delay: number; reduced: boolean }) {
  const flicker = useSharedValue(0);
  // Each kitsunebi pops in as it lights, then keeps flickering.
  const pop = useSharedValue(reduced ? 1 : 0.5);
  useEffect(() => {
    if (reduced) return;
    pop.set(withSpring(1, { duration: 360, dampingRatio: 0.45 }));
    flicker.set(
      withDelay(delay, withRepeat(withTiming(1, { duration: 900 }), -1, true)),
    );
  }, [delay, reduced, flicker, pop]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.get() * 2 - 0.4),
    transform: [
      { translateY: -2 * flicker.get() },
      { scale: pop.get() * (1 + 0.06 * flicker.get()) },
    ],
  }));
  return (
    <Animated.View className="-mr-1.5" style={style}>
      <Flame tone="kitsunebi" size={20} />
    </Animated.View>
  );
}
