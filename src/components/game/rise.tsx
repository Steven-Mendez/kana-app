import type { ReactNode } from 'react';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { rise, stagger } from '@/lib/motion';

/** Rises into place on mount, `index` steps after its siblings. */
export function Rise({
  index = 0,
  delay = 0,
  className,
  children,
}: {
  index?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      className={className}
      entering={reduced ? undefined : rise(delay + index * stagger)}
    >
      {children}
    </Animated.View>
  );
}
