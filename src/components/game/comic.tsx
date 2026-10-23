import { useId, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

import { cn } from '@/lib/utils';

/**
 * A comic caption box: uppercase display type, slightly tilted, like the
 * narration label in the corner of a panel. `soft` for informative panels,
 * `ink` only where the panel should grab attention.
 */
export function Caption({
  children,
  tone = 'soft',
  className,
}: {
  children: ReactNode;
  tone?: 'soft' | 'ink' | 'primary' | 'gold';
  className?: string;
}) {
  return (
    <View
      className={cn(
        'self-start border-2 px-2.5 py-0.5',
        {
          soft: 'border-line bg-accent',
          ink: 'border-foreground bg-foreground',
          primary: 'border-primary-lip bg-primary',
          gold: 'border-gold-lip bg-gold',
        }[tone],
        className,
      )}
      style={{ transform: [{ rotate: '-2deg' }] }}
    >
      <Text
        className={cn(
          'font-display text-xs tracking-wider uppercase',
          {
            soft: 'text-accent-foreground',
            ink: 'text-background',
            primary: 'text-primary-foreground',
            gold: 'text-on-bright',
          }[tone],
        )}
      >
        {children}
      </Text>
    </View>
  );
}

/** Printed halftone dots, laid behind a panel's content. Decorative only. */
export function Halftone({
  className,
  spacing = 9,
  radius = 1.6,
}: {
  className?: string;
  spacing?: number;
  radius?: number;
}) {
  const id = useId().replace(/:/g, '');
  const ink = useCSSVariable('--color-foreground');
  return (
    <View
      pointerEvents="none"
      accessible={false}
      className={cn('absolute inset-0 overflow-hidden opacity-10', className)}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={id}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <Circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={radius}
              fill={typeof ink === 'string' ? ink : '#000'}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** A speech bubble with a soft outline and a tail toward its speaker. */
export function SpeechBubble({
  children,
  tail = 'left',
  className,
}: {
  children: ReactNode;
  tail?: 'left' | 'top';
  className?: string;
}) {
  return (
    <View
      className={cn('relative', tail === 'left' ? 'pl-2' : 'pt-2', className)}
    >
      <View className="rounded-[18px] border-2 border-line bg-card px-4 py-2.5">
        {children}
      </View>
      {/* Drawn over the bubble's border so the tail joins its outline. */}
      <View
        accessible={false}
        pointerEvents="none"
        className={cn(
          'absolute size-4 border-line bg-card',
          tail === 'left'
            ? 'top-4 left-[1px] border-b-2 border-l-2'
            : 'top-[1px] left-6 border-t-2 border-l-2',
        )}
        style={{ transform: [{ rotate: '45deg' }] }}
      />
    </View>
  );
}

/** A screen title: bold UI type in sentence case, no decoration. */
export function ScreenTitle({
  children,
  size = 'lg',
}: {
  children: ReactNode;
  size?: 'md' | 'lg';
}) {
  return (
    <Text
      accessibilityRole="header"
      numberOfLines={1}
      className={cn(
        'font-ui-bold text-foreground',
        size === 'lg' ? 'text-3xl' : 'text-[22px]',
      )}
    >
      {children}
    </Text>
  );
}
