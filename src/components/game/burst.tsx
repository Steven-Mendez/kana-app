import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

import { durations, easeOut } from '@/lib/motion';

const SPARK = 'M5 0l1.4 3.6L10 5 6.4 6.4 5 10 3.6 6.4 0 5l3.6-1.4z';

/**
 * Gold sparks thrown out of the centre of its parent once, fading as they fly.
 * Decorative: hidden from assistive technology and absent with reduced motion.
 * Change `trigger` to throw a new burst.
 */
export function Burst({
  count = 6,
  radius = 24,
  size = 10,
  delay = 0,
  trigger = 0,
}: {
  count?: number;
  radius?: number;
  size?: number;
  delay?: number;
  trigger?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0 items-center justify-center"
    >
      {Array.from({ length: count }, (_, index) => (
        <Spark
          key={`${trigger}:${index}`}
          angle={(360 / count) * index - 90}
          radius={radius}
          size={size}
          delay={delay + (index % 2) * 40}
        />
      ))}
    </View>
  );
}

function Spark({
  angle,
  radius,
  size,
  delay,
}: {
  angle: number;
  radius: number;
  size: number;
  delay: number;
}) {
  const [gold, ink] = useCSSVariable(['--color-gold', '--color-foreground']);
  const flight = useSharedValue(0);
  useEffect(() => {
    flight.set(
      withDelay(
        delay,
        withTiming(1, { duration: durations.burst, easing: easeOut }),
      ),
    );
  }, [delay, flight]);
  const radians = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => {
    const distance = radius * flight.get();
    return {
      opacity: interpolate(flight.get(), [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: Math.cos(radians) * distance },
        { translateY: Math.sin(radians) * distance },
        { rotate: `${flight.get() * 90}deg` },
        { scale: 1.2 - 0.6 * flight.get() },
      ],
    };
  });
  const color = (value: unknown) =>
    typeof value === 'string' ? value : undefined;
  return (
    <Animated.View className="absolute" style={style}>
      <Svg width={size} height={size} viewBox="0 0 10 10" aria-hidden>
        <Path
          d={SPARK}
          fill={color(gold)}
          stroke={color(ink)}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
