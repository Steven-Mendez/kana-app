import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

const BODY =
  'M12 1.6c1.4 3.6 6.4 5.9 6.4 12.1a6.4 6.4 0 0 1-12.8 0c0-2.7 1.2-4.5 2.6-5.7.3 1.9 1.2 3 2.5 3.7-.1-3.8-1-6.3 1.3-10.1z';
const CORE = 'M12 14.6c1.8 1.4 3 2.6 3 4.3a3 3 0 0 1-6 0c0-1.6 1-2.6 3-4.3z';

const tones = {
  streak: ['--color-tangerine', '--color-gold'],
  kitsunebi: ['--color-kitsunebi', '--color-card'],
  // A streak not yet kept today: the outline waits to be filled.
  pending: ['--color-card', '--color-tangerine'],
  off: ['--color-locked', '--color-locked'],
} as const;

const SWAY = { duration: 1100, easing: Easing.inOut(Easing.sin) };
const STRETCH = { duration: 640, easing: Easing.inOut(Easing.sin) };

/**
 * Cartoon flame with an ink outline: tangerine for streaks, blue kitsunebi for
 * combos. A `live` lit flame sways and stretches from its base.
 */
export function Flame({
  tone = 'streak',
  size = 24,
  live = false,
}: {
  tone?: keyof typeof tones;
  size?: number;
  live?: boolean;
}) {
  const [body, core, ink] = useCSSVariable([
    ...tones[tone],
    '--color-foreground',
  ]);
  const reduced = useReducedMotion();
  const lit = live && !reduced && (tone === 'streak' || tone === 'kitsunebi');
  const sway = useSharedValue(0);
  const stretch = useSharedValue(0);
  useEffect(() => {
    if (!lit) {
      sway.set(0);
      stretch.set(0);
      return;
    }
    // Two loops at unrelated rates keep the flame from looking mechanical.
    sway.set(withRepeat(withTiming(1, SWAY), -1, true));
    stretch.set(withRepeat(withTiming(1, STRETCH), -1, true));
  }, [lit, sway, stretch]);
  const style = useAnimatedStyle(() => {
    if (!lit) return { transform: [] };
    return {
      transformOrigin: 'bottom',
      transform: [
        { rotate: `${(sway.get() - 0.5) * 8}deg` },
        { scaleY: 0.95 + 0.1 * stretch.get() },
        { scaleX: 1.03 - 0.06 * stretch.get() },
      ],
    };
  });

  const color = (value: unknown) =>
    typeof value === 'string' ? value : undefined;
  return (
    <Animated.View style={style}>
      <Svg
        width={size}
        height={(size * 26) / 24}
        viewBox="0 0 24 26"
        aria-hidden
      >
        <Path
          d={BODY}
          fill={color(body)}
          stroke={color(ink)}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <Path d={CORE} fill={color(core)} />
      </Svg>
    </Animated.View>
  );
}
