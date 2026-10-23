import { Easing, FadeInDown } from 'react-native-reanimated';

// One rhythm for every game motion: the same curves, springs and steps.

/** Strong ease-out: arrivals start fast and settle. */
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const springs = {
  /** A piece landing with a little bounce (stamps, badges, coins). */
  pop: { duration: 360, dampingRatio: 0.5 },
  /** Settles without wobble (cards arriving). */
  settle: { duration: 320, dampingRatio: 0.8 },
} as const;

export const durations = { tap: 120, enter: 260, burst: 620 } as const;

/** Delay between items that enter one after another. */
export const stagger = 45;

/** Rises a few pixels into place: list and panel entrances. */
export const rise = (delay = 0) =>
  FadeInDown.delay(delay).duration(durations.enter).easing(easeOut);
