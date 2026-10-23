import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/utils';

const PRESS = { duration: 90, easing: Easing.bezier(0.23, 1, 0.32, 1) };
const LIFT = { duration: 120, easing: Easing.bezier(0.23, 1, 0.32, 1) };

/** Press state for a game piece, driven from Pressable's press-in/out. */
export function usePressDepth() {
  const pressed = useSharedValue(0);
  return {
    pressed,
    onPressIn: () => pressed.set(withTiming(1, PRESS)),
    onPressOut: () => pressed.set(withTiming(0, PRESS)),
  };
}

/**
 * The shared game-piece body: a softly outlined face (callers may pass ink
 * or a fill's own edge color) over a hard comic shadow offset down and to the
 * right. The face moves into the shadow by `depth` while pressed, covering
 * it, and rises by `lift` when the piece is raised (a selected answer). The
 * shadow is a plain view, not a platform shadow, so it looks the same on iOS,
 * Android and web.
 */
export function Depth({
  depth,
  pressed,
  lift = 0,
  shapeClassName,
  faceClassName,
  edgeClassName,
  className,
  children,
}: {
  depth: number;
  pressed?: ReturnType<typeof usePressDepth>['pressed'];
  lift?: number;
  shapeClassName: string;
  faceClassName: string;
  edgeClassName?: string;
  className?: string;
  children?: ReactNode;
}) {
  const raised = useSharedValue(lift);
  useEffect(() => {
    raised.set(withTiming(lift, LIFT));
  }, [lift, raised]);

  const face = useAnimatedStyle(() => {
    const press = (pressed?.get() ?? 0) * depth;
    return {
      transform: [
        { translateX: press - raised.get() },
        { translateY: press - raised.get() },
      ],
    };
  });
  const edge = useAnimatedStyle(() => ({
    transform: [{ translateX: -raised.get() }, { translateY: -raised.get() }],
  }));

  return (
    <View
      className={cn('relative', className)}
      style={{ paddingBottom: depth, paddingRight: depth }}
    >
      {depth > 0 && edgeClassName ? (
        <Animated.View
          pointerEvents="none"
          className={cn(
            'absolute right-0 bottom-0',
            shapeClassName,
            edgeClassName,
          )}
          style={[{ top: depth, left: depth }, edge]}
        />
      ) : null}
      <Animated.View
        className={cn('border-2 border-line', shapeClassName, faceClassName)}
        style={face}
      >
        {children}
      </Animated.View>
    </View>
  );
}
