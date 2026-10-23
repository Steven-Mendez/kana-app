import { useEffect, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/utils';

/**
 * A section of a calm screen: an uppercase label, an optional trailing
 * action, and its content. Sections are separated by space, not boxes.
 */
export function Section({
  label,
  trailing,
  children,
  className,
  testID,
}: {
  label: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
  testID?: string;
}) {
  return (
    <View testID={testID} className={cn('gap-3', className)}>
      <View className="min-h-6 flex-row items-center justify-between gap-3">
        <SectionLabel>{label}</SectionLabel>
        {trailing}
      </View>
      {children}
    </View>
  );
}

/** Metadata-level uppercase label for a section. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      accessibilityRole="header"
      className="font-ui-bold text-[13px] tracking-wider text-muted-foreground uppercase"
    >
      {children}
    </Text>
  );
}

/** A hairline between sections or list rows. */
export function Divider({ className }: { className?: string }) {
  return (
    <View
      accessible={false}
      className={cn('h-px bg-foreground/[0.07]', className)}
    />
  );
}

/** One metric laid out inline: icon, value and label, without a border. */
export function InlineStat({
  icon,
  value,
  label,
  className,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={cn('flex-row items-center gap-3', className)}
    >
      <View className="size-8 items-center justify-center">{icon}</View>
      <View className="min-w-0 flex-1">
        <Text className="font-ui-bold text-xl text-foreground tabular-nums">
          {value}
        </Text>
        <Text
          numberOfLines={1}
          className="font-ui text-[13px] text-muted-foreground"
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

/** A placeholder block shaped like the content that is loading. */
export function Skeleton({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    pulse.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));
  }, [reduced, pulse]);
  const style = useAnimatedStyle(() => ({ opacity: 1 - 0.5 * pulse.get() }));
  return (
    <Animated.View
      accessible={false}
      className={cn('rounded-lg bg-muted', className)}
      style={style}
    />
  );
}

/** A low-emphasis text action, such as "Explore" beside a section label. */
export function TextAction({
  label,
  onPress,
  tone = 'neutral',
  disabled = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'muted';
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      testID={testID}
      className={cn(
        'min-h-11 justify-center self-start rounded-md active:opacity-60 focus-visible:outline-2 focus-visible:outline-ring',
        disabled && 'opacity-40',
      )}
    >
      <Text
        className={cn(
          'font-ui-bold text-[15px] underline',
          tone === 'neutral' ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
