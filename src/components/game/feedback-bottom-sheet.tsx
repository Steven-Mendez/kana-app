import { useEffect, type ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

import { GameButton } from '@/components/game/game-button';
import { answerHaptic } from '@/lib/haptics';
import { easeOut, springs } from '@/lib/motion';
import { cn } from '@/lib/utils';

// A short rise, not a slide from the screen edge: the ribbon is there at once.
const RISE = FadeInDown.duration(220)
  .easing(easeOut)
  .withInitialValues({ transform: [{ translateY: 32 }] });

// Ten notches across a stretched 120×12 box give the ribbon its cut edge.
const NOTCHES = `M0 12 ${Array.from({ length: 10 }, (_, index) => `L${index * 12 + 6} 2 L${index * 12 + 12} 12`).join(' ')} Z`;

/**
 * The foot of a round after checking: a ribbon with the kitsune peeking over
 * it, one line about the answer and the button to go on. It replaces the
 * action bar in place; it is not a modal.
 */
export function FeedbackBottomSheet({
  tone,
  title,
  message,
  continueLabel,
  onContinue,
  continueDisabled = false,
  haptic = true,
  bottomInset = 0,
  testID,
  continueTestID,
}: {
  tone: 'correct' | 'wrong';
  title: string;
  message?: ReactNode;
  continueLabel: string;
  onContinue: () => void;
  continueDisabled?: boolean;
  /** Off when the screen already fired the haptic for this grade. */
  haptic?: boolean;
  /** The bottom safe-area inset the fill extends into when pinned to the edge. */
  bottomInset?: number;
  testID?: string;
  continueTestID?: string;
}) {
  const reduced = useReducedMotion();
  const correct = tone === 'correct';
  const [tint] = useCSSVariable([correct ? '--color-gold' : '--color-sumi']);
  // The mascot pops from a partial scale (a transform, so the row never
  // reflows): it hops when right and shakes its head when wrong. The title
  // lands a beat later.
  const pop = useSharedValue(reduced ? 1 : 0.6);
  const tilt = useSharedValue(correct ? 0 : -10);
  const word = useSharedValue(reduced ? 1 : 0.85);
  useEffect(() => {
    if (reduced) return;
    pop.set(withDelay(60, withSpring(1, springs.pop)));
    word.set(withDelay(100, withSpring(1, springs.pop)));
    tilt.set(
      correct
        ? withDelay(
            120,
            withSequence(
              withTiming(-8, { duration: 90, easing: easeOut }),
              withTiming(6, { duration: 90, easing: easeOut }),
              withSpring(0, springs.pop),
            ),
          )
        : withDelay(
            120,
            withSequence(
              withTiming(-18, { duration: 70 }),
              withTiming(-2, { duration: 70 }),
              withTiming(-16, { duration: 70 }),
              withSpring(-10, springs.pop),
            ),
          ),
    );
  }, [reduced, correct, pop, tilt, word]);
  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.get() }],
  }));
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt.get()}deg` }, { scale: correct ? 1 : 1.06 }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transformOrigin: 'left',
    transform: [{ scale: word.get() }],
  }));

  useEffect(() => {
    if (haptic) answerHaptic(correct);
  }, [correct, haptic]);

  return (
    <Animated.View
      testID={testID}
      entering={reduced ? undefined : RISE}
      accessibilityRole={correct ? 'summary' : 'alert'}
      accessibilityLiveRegion={correct ? 'polite' : 'assertive'}
      className="w-full"
    >
      <Svg
        width="100%"
        height={12}
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        aria-hidden
      >
        <Path d={NOTCHES} fill={typeof tint === 'string' ? tint : undefined} />
      </Svg>
      <View
        className={cn('gap-4 px-5 pt-3', correct ? 'bg-gold' : 'bg-sumi')}
        style={{ paddingBottom: 24 + bottomInset }}
      >
        <View className="flex-row items-center gap-4">
          <Animated.View
            style={mascotStyle}
            className="-mt-9 size-14 overflow-hidden rounded-full border-[3px] border-card bg-primary"
          >
            <Animated.View className="size-full" style={faceStyle}>
              <Image
                source={require('../../../assets/icon.png')}
                accessible={false}
                accessibilityIgnoresInvertColors
                className="size-full"
              />
            </Animated.View>
          </Animated.View>
          <View className="flex-1 gap-1">
            <Animated.View style={titleStyle}>
              <Text
                className={cn(
                  'font-display text-[22px] leading-[26px]',
                  correct ? 'text-on-bright' : 'text-on-sumi',
                )}
              >
                {title}
              </Text>
            </Animated.View>
            {message ? (
              <Text
                className={cn(
                  'font-ui text-base leading-6',
                  correct ? 'text-on-bright' : 'text-on-sumi',
                )}
              >
                {message}
              </Text>
            ) : null}
          </View>
        </View>
        <GameButton
          block
          onPress={onContinue}
          disabled={continueDisabled}
          testID={continueTestID ?? (testID ? `${testID}-continue` : undefined)}
        >
          {continueLabel}
        </GameButton>
      </View>
    </Animated.View>
  );
}
