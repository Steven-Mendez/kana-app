import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/utils';

const tones = {
  primary: 'bg-primary',
  success: 'bg-success-fill',
  tangerine: 'bg-tangerine',
  // Unseen kana are neutral; a full red bar would read as an alert.
  neutral: 'bg-muted-foreground/25',
};

const FILL = { duration: 700, easing: Easing.bezier(0.23, 1, 0.32, 1) };

/** A rounded bar for saved progress on a muted track; it fills as it appears. */
export function Meter({
  value,
  total,
  label,
  tone = 'primary',
}: {
  value: number;
  total: number;
  label: string;
  tone?: keyof typeof tones;
}) {
  const percent = total ? Math.min(100, (value / total) * 100) : 0;
  const reduced = useReducedMotion();
  const fill = useSharedValue(reduced ? percent : 0);
  useEffect(() => {
    fill.set(reduced ? percent : withTiming(percent, FILL));
  }, [percent, reduced, fill]);
  // The fill is childless, so animating its width re-lays out nothing else.
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get()}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: total, now: value }}
      className="h-3.5 overflow-hidden rounded-full bg-muted"
    >
      {percent ? (
        <Animated.View
          className={cn('h-full rounded-full', tones[tone])}
          style={fillStyle}
        />
      ) : null}
    </View>
  );
}
