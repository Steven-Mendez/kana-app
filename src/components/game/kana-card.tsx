import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withDelay,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';
import { scheduleOnRN } from 'react-native-worklets';

import { Burst } from '@/components/game/burst';
import { Depth, usePressDepth } from '@/components/game/depth';
import { Flame } from '@/components/game/flame';
import { pressHaptic } from '@/lib/haptics';
import { durations, easeOut, springs } from '@/lib/motion';
import { usePreferences } from '@/lib/preferences-provider';
import { cn } from '@/lib/utils';

export type KanaCardState =
  'default' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const STAMP =
  'M54 12 C79 13 91 34 88 57 C84 80 59 91 36 84 C14 77 7 53 15 33 C22 19 36 11 56 15';
const SPARKS = [
  'M92 10 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z',
  'M6 74 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z',
];
const HALF_FLIP = { duration: 210, easing: Easing.bezier(0.23, 1, 0.32, 1) };

type KanaCardProps = {
  kana: string;
  variant: 'hero' | 'option';
  state?: KanaCardState;
  reading?: string;
  combo?: number;
  onPress?: () => void;
  testID?: string;
};

/**
 * A kana as a game card. The result happens on the card itself: a correct
 * answer is stamped with a vermilion circle, a wrong one flips to its back.
 */
export function KanaCard(props: KanaCardProps) {
  return props.variant === 'hero' || !props.onPress ? (
    <StillCard {...props} />
  ) : (
    <OptionCard {...props} />
  );
}

function StillCard({ testID, ...card }: KanaCardProps) {
  const { t } = usePreferences();
  const { kana, state, reading } = card;
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={
        state === 'wrong' && reading ? `${kana}, ${t.gameWrong(reading)}` : kana
      }
      className={cn(state === 'dimmed' && 'opacity-40')}
    >
      <CardBody {...card} />
    </View>
  );
}

function OptionCard({ testID, onPress, ...card }: KanaCardProps) {
  const { pressed, onPressIn, onPressOut } = usePressDepth();
  const dimmed = card.state === 'dimmed';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={card.kana}
      accessibilityState={{
        selected: card.state === 'selected',
        disabled: dimmed,
      }}
      disabled={dimmed}
      onPress={onPress}
      onPressIn={() => {
        onPressIn();
        pressHaptic();
      }}
      onPressOut={onPressOut}
      className={cn(
        'rounded-tile focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring',
        dimmed && 'opacity-40',
      )}
    >
      <CardBody {...card} pressed={pressed} />
    </Pressable>
  );
}

function CardBody({
  kana,
  variant,
  state = 'default',
  reading,
  combo = 0,
  pressed,
}: Omit<KanaCardProps, 'onPress' | 'testID'> & {
  pressed?: ReturnType<typeof usePressDepth>['pressed'];
}) {
  const { t } = usePreferences();
  const reduced = useReducedMotion();
  const hero = variant === 'hero';
  const { showBack, flipStyle } = useCardResult(state, reading, reduced);
  const enterStyle = useCardEntrance(kana, hero, reduced);
  const shape = hero ? 'rounded-card' : 'rounded-tile';
  const look = cardLook(state, showBack);
  const showCombo = combo >= 3 && !showBack;
  const correct = state === 'correct' && !showBack;

  return (
    <Animated.View style={enterStyle}>
      <Animated.View style={flipStyle}>
        {showCombo ? (
          <View
            pointerEvents="none"
            className={cn('absolute -inset-2 bg-kitsunebi-soft', shape)}
          />
        ) : null}
        <Depth
          depth={4}
          pressed={pressed}
          lift={state === 'selected' ? 6 : 0}
          shapeClassName={shape}
          faceClassName={cn(
            'items-center justify-center',
            hero ? 'h-[236px] w-[196px]' : 'h-[112px] w-[92px]',
            look.face,
          )}
          edgeClassName={look.edge}
        >
          <CardFace
            kana={kana}
            hero={hero}
            glyph={look.glyph}
            back={showBack}
            correct={correct}
            reduced={reduced}
            reading={reading}
          />
        </Depth>
        {correct && reading && hero ? (
          <ReadingTag reading={reading} reduced={reduced} />
        ) : null}
        {showCombo ? (
          <ComboBadge combo={combo} label={t.gameCombo(combo)} />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

/** Each new prompt deals in: up from slightly small, settling without wobble. */
function useCardEntrance(kana: string, hero: boolean, reduced: boolean) {
  const enter = useSharedValue(1);
  useEffect(() => {
    if (!hero || reduced) return;
    enter.set(0);
    enter.set(withSpring(1, springs.settle));
  }, [kana, hero, reduced, enter]);
  return useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.get() * 1.5),
    transform: [
      { translateY: 16 * (1 - enter.get()) },
      { scale: 0.94 + 0.06 * enter.get() },
    ],
  }));
}

/** Announces a graded card and flips it to its back when the answer is wrong. */
function useCardResult(
  state: KanaCardState,
  reading: string | undefined,
  reduced: boolean,
) {
  const { t } = usePreferences();
  const [showBack, setShowBack] = useState(state === 'wrong');
  // Leaving `wrong`, or entering it without motion, swaps faces right away;
  // with motion the flip swaps them at its midpoint instead.
  if (showBack && state !== 'wrong') setShowBack(false);
  if (!showBack && state === 'wrong' && reduced) setShowBack(true);
  const flip = useSharedValue(1);
  const bump = useSharedValue(1);
  const shake = useSharedValue(0);
  const previous = useRef(state);

  useEffect(() => {
    const was = previous.current;
    previous.current = state;
    if (was === state) return;
    if (reading && (state === 'correct' || state === 'wrong'))
      AccessibilityInfo.announceForAccessibility(
        state === 'correct' ? t.gameCorrect(reading) : t.gameWrong(reading),
      );
    if (reduced) return;
    if (state === 'correct')
      // A quick hop as the stamp lands: the card itself says "yes".
      bump.set(
        withSequence(
          withTiming(1.05, { duration: 100, easing: easeOut }),
          withSpring(1, springs.pop),
        ),
      );
    if (state !== 'wrong') return;
    // Close to an edge, swap faces while it is invisible, open again.
    flip.set(
      withSequence(
        withTiming(0, HALF_FLIP, (finished) => {
          if (finished) scheduleOnRN(setShowBack, true);
        }),
        withTiming(1, HALF_FLIP),
      ),
    );
    // Once the back is showing, a short head-shake: "not that one".
    shake.set(
      withDelay(
        HALF_FLIP.duration * 2,
        withSequence(
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(-5, { duration: 60 }),
          withTiming(0, { duration: 60 }),
        ),
      ),
    );
  }, [state, reading, reduced, flip, bump, shake, t]);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.get() },
      { scaleX: flip.get() },
      { scale: bump.get() },
    ],
  }));
  return { showBack, flipStyle };
}

function CardFace({
  kana,
  hero,
  glyph,
  back,
  correct,
  reduced,
  reading,
}: {
  kana: string;
  hero: boolean;
  glyph: string;
  back: boolean;
  correct: boolean;
  reduced: boolean;
  reading?: string;
}) {
  if (back) return <CardBack kana={kana} reading={reading} hero={hero} />;
  return (
    <>
      <Text
        className={cn(
          'font-kana',
          glyph,
          // Yōon are two glyphs; they share the card's fixed width.
          [...kana].length > 1
            ? hero
              ? 'text-[72px] leading-[84px]'
              : 'text-[30px] leading-[36px]'
            : hero
              ? 'text-[104px] leading-[116px]'
              : 'text-[44px] leading-[50px]',
        )}
        numberOfLines={1}
        lang="ja"
      >
        {kana}
      </Text>
      {correct ? <CardStamp reduced={reduced} /> : null}
    </>
  );
}

function cardLook(state: KanaCardState, back: boolean) {
  if (back)
    return {
      face: 'border-sumi-lip bg-sumi',
      edge: 'bg-sumi-lip',
      glyph: 'text-on-sumi',
    };
  // Selection stays neutral: the lift carries it, not an extra accent.
  if (state === 'selected')
    return {
      face: 'border-foreground/30 bg-muted',
      edge: 'bg-shade',
      glyph: 'text-foreground',
    };
  return {
    face: 'border-line bg-card',
    edge: 'bg-shade',
    glyph: 'text-foreground',
  };
}

/** The back a wrong card flips to: the kana and its reading (the ribbon says what was chosen). */
function CardBack({
  kana,
  reading,
  hero,
}: {
  kana: string;
  reading?: string;
  hero: boolean;
}) {
  return (
    <View className="items-center gap-1 px-2">
      <Text
        className={cn(
          'font-kana text-on-sumi',
          [...kana].length > 1
            ? hero
              ? 'text-[48px] leading-[54px]'
              : 'text-2xl'
            : hero
              ? 'text-[64px] leading-[70px]'
              : 'text-3xl',
        )}
        numberOfLines={1}
        lang="ja"
      >
        {kana}
      </Text>
      {reading ? (
        <Text
          className={cn(
            'font-display text-on-sumi',
            hero ? 'text-[26px] leading-[30px]' : 'text-base',
          )}
        >
          {reading}
        </Text>
      ) : null}
    </View>
  );
}

function CardStamp({ reduced }: { reduced: boolean }) {
  const [vermilion, gold, ink] = useCSSVariable([
    '--color-primary',
    '--color-gold',
    '--color-foreground',
  ]);
  const scale = useSharedValue(reduced ? 1 : 1.18);
  const opacity = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    // The stamp lands hard and settles, like a seal pressed onto the card:
    // opaque almost at once, from just above its size, so it never ghosts.
    scale.set(withSpring(1, { duration: 280, dampingRatio: 0.6 }));
    opacity.set(withTiming(1, { duration: 60 }));
  }, [reduced, scale, opacity]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ scale: scale.get() }, { rotate: '-8deg' }],
  }));
  const color = (value: unknown) =>
    typeof value === 'string' ? value : undefined;
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-[6%]"
      style={style}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" aria-hidden>
        <Path
          d={STAMP}
          fill="none"
          stroke={color(vermilion)}
          strokeWidth={7}
          strokeLinecap="round"
        />
        {SPARKS.map((d) => (
          <Path
            key={d}
            d={d}
            fill={color(gold)}
            stroke={color(ink)}
            strokeWidth={2}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

function ReadingTag({
  reading,
  reduced,
}: {
  reading: string;
  reduced: boolean;
}) {
  const scale = useSharedValue(reduced ? 1 : 0.6);
  useEffect(() => {
    if (!reduced)
      scale.set(withSpring(1, { duration: 300, dampingRatio: 0.6 }));
  }, [reduced, scale]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute -bottom-3 self-center rounded-full border-2 border-gold-lip bg-gold px-4 py-1"
      style={style}
    >
      <Text className="font-display text-lg text-on-bright">{reading}</Text>
    </Animated.View>
  );
}

/** The `×N` combo badge; it pops each time the combo grows. */
function ComboBadge({ combo, label }: { combo: number; label: string }) {
  const reduced = useReducedMotion();
  const pop = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    pop.set(
      withSequence(
        withTiming(1.3, { duration: durations.tap, easing: easeOut }),
        withSpring(1, springs.pop),
      ),
    );
  }, [combo, reduced, pop]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pop.get() }, { rotate: `${(pop.get() - 1) * 20}deg` }],
  }));
  return (
    <Animated.View
      accessibilityLabel={label}
      className="absolute -right-4 -top-4 flex-row items-center gap-1 rounded-full border-2 border-line bg-card py-0.5 pl-2 pr-3"
      style={style}
    >
      {/* A new kitsunebi lights at every third answer in a row. */}
      {combo % 3 === 0 ? <Burst trigger={combo} radius={30} /> : null}
      <Flame tone="kitsunebi" size={18} live />
      <Text className="font-display text-lg text-kitsunebi-text">×{combo}</Text>
    </Animated.View>
  );
}
