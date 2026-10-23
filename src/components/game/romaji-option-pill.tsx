import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Depth, usePressDepth } from '@/components/game/depth';
import { pressHaptic } from '@/lib/haptics';
import { springs, stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type RomajiOptionState =
  'default' | 'selected' | 'correct' | 'wrong' | 'dimmed' | 'used';

const looks = {
  default: {
    face: 'border-line bg-card',
    edge: 'bg-shade',
    text: 'text-foreground',
  },
  // Selection stays neutral: the lift carries it, not an extra accent.
  selected: {
    face: 'border-foreground/30 bg-muted',
    edge: 'bg-shade',
    text: 'text-foreground',
  },
  correct: {
    face: 'border-gold-lip bg-gold',
    edge: 'bg-gold-lip',
    text: 'text-on-bright',
  },
  wrong: {
    face: 'border-sumi-lip bg-sumi',
    edge: 'bg-sumi-lip',
    text: 'text-on-sumi',
  },
  dimmed: {
    face: 'border-line bg-card',
    edge: 'bg-shade',
    text: 'text-foreground',
  },
  used: {
    face: 'border-dashed border-locked-lip bg-transparent',
    edge: '',
    text: 'text-transparent',
  },
} as const;

/** A rōmaji reading as an arcade coin, tapped instead of typed on touch screens. */
export function RomajiOptionPill({
  romaji,
  state = 'default',
  shortcut,
  deal,
  index = 0,
  onPress,
  testID,
}: {
  romaji: string;
  state?: RomajiOptionState;
  shortcut?: number;
  /** Changing it deals the coin in again, `index` steps after the first. */
  deal?: string;
  index?: number;
  onPress?: () => void;
  testID?: string;
}) {
  const reduced = useReducedMotion();
  const { pressed, onPressIn, onPressOut } = usePressDepth();
  const scale = useSharedValue(1);
  const shift = useSharedValue(0);
  const dealt = useSharedValue(1);

  useEffect(() => {
    if (reduced || deal === undefined) return;
    dealt.set(0);
    dealt.set(withDelay(80 + index * stagger, withSpring(1, springs.pop)));
  }, [deal, index, reduced, dealt]);

  useEffect(() => {
    if (reduced) return;
    if (state === 'correct')
      scale.set(
        withSequence(
          withTiming(1.1, { duration: 130 }),
          withTiming(1, { duration: 170 }),
        ),
      );
    if (state === 'wrong')
      shift.set(
        withSequence(
          withTiming(-6, { duration: 70 }),
          withTiming(6, { duration: 70 }),
          withTiming(-3, { duration: 70 }),
          withTiming(0, { duration: 70 }),
        ),
      );
  }, [state, reduced, scale, shift]);

  const motion = useAnimatedStyle(() => ({
    opacity: Math.min(1, dealt.get() * 2),
    transform: [
      { translateX: shift.get() },
      { translateY: 12 * (1 - dealt.get()) },
      { scale: scale.get() * (0.7 + 0.3 * dealt.get()) },
    ],
  }));

  const look = looks[state];
  const inert = state === 'used' || state === 'dimmed';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={romaji}
      accessibilityState={{ selected: state === 'selected', disabled: inert }}
      accessibilityElementsHidden={state === 'used'}
      importantForAccessibility={
        state === 'used' ? 'no-hide-descendants' : 'auto'
      }
      disabled={inert}
      onPress={onPress}
      onPressIn={() => {
        onPressIn();
        pressHaptic();
      }}
      onPressOut={onPressOut}
      className={cn(
        'rounded-full focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring',
        state === 'dimmed' && 'opacity-40',
      )}
    >
      <Animated.View style={motion}>
        <Depth
          depth={state === 'used' ? 0 : 4}
          pressed={pressed}
          lift={state === 'selected' ? 8 : 0}
          shapeClassName="rounded-full"
          faceClassName={cn(
            'size-[84px] items-center justify-center',
            look.face,
          )}
          edgeClassName={look.edge || undefined}
        >
          {state !== 'used' ? (
            <View
              pointerEvents="none"
              className="absolute inset-[5px] rounded-full border-[1.5px] border-border"
            />
          ) : null}
          <Text
            className={cn('font-ui-bold text-[22px] leading-[26px]', look.text)}
          >
            {romaji}
          </Text>
        </Depth>
        {shortcut !== undefined && state !== 'used' ? (
          <View className="absolute -left-2 -top-2 min-w-6 items-center rounded-lg border-2 border-line bg-card px-1 py-0.5">
            <Text className="font-ui-bold text-[11px] text-foreground">
              {shortcut}
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
