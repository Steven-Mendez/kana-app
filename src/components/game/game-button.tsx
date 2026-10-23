import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Depth, usePressDepth } from '@/components/game/depth';
import { Text, TextClassContext } from '@/components/ui/text';
import { pressHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

export type GameButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'quiet'
  | 'destructive';

// One height for every button, raised or flat, on every screen.
const face = cva(
  'min-h-14 flex-row items-center justify-center gap-2 px-6 py-2',
  {
    variants: {
      variant: {
        primary: 'border-primary-lip bg-primary',
        secondary: 'border-line bg-card',
        success: 'border-gold-lip bg-gold',
        danger: 'border-sumi-lip bg-sumi',
        outline: 'border-dashed border-line bg-transparent',
        quiet: 'border-line bg-card',
        destructive: 'border-error bg-error',
        disabled: 'border-locked-lip bg-locked',
      },
    },
  },
);

const edge = {
  primary: 'bg-primary-lip',
  secondary: 'bg-line',
  success: 'bg-gold-lip',
  danger: 'bg-sumi-lip',
} as const;

const label = cva('font-display text-center text-lg', {
  variants: {
    variant: {
      primary: 'text-primary-foreground',
      secondary: 'text-foreground',
      success: 'text-on-bright',
      danger: 'text-on-sumi',
      outline: 'text-foreground',
      quiet: 'font-ui-bold text-foreground',
      destructive: 'font-ui-bold text-primary-foreground',
      disabled: 'text-on-locked',
    },
  },
  compoundVariants: [
    { variant: ['quiet', 'destructive'], className: 'text-base' },
  ],
});

/**
 * Arcade capsule button: the face presses 5px into its edge on press-in.
 * Primary buttons span the full width; raised buttons keep their edge space
 * even when disabled, so a button never changes size between states.
 */
export function GameButton({
  variant = 'primary',
  children,
  onPress,
  disabled = false,
  block = variant === 'primary',
  className,
  testID,
}: {
  variant?: GameButtonVariant;
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  block?: boolean;
  /** Layout only (alignment, margins); the look comes from the variant. */
  className?: string;
  testID?: string;
}) {
  const { pressed, onPressIn, onPressOut } = usePressDepth();
  const look = disabled ? 'disabled' : variant;
  const depth = variant === 'quiet' || variant === 'destructive' ? 0 : 5;
  return (
    <TextClassContext.Provider value={label({ variant: look })}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          onPressIn();
          pressHaptic();
        }}
        onPressOut={onPressOut}
        testID={testID}
        className={cn(
          'rounded-full focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring',
          block ? 'w-full' : 'self-start',
          className,
        )}
      >
        <Depth
          depth={depth}
          pressed={pressed}
          shapeClassName="rounded-full"
          faceClassName={face({ variant: look })}
          edgeClassName={
            look in edge ? edge[look as keyof typeof edge] : undefined
          }
        >
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </Depth>
      </Pressable>
    </TextClassContext.Provider>
  );
}
