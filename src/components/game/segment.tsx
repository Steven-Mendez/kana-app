import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { selectHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  accessibilityLabel?: string;
  testID?: string;
  /** A small count in the corner, such as selected kana. */
  badge?: number;
};

/**
 * Outlined capsules for one choice out of a few. `radio` for settings and
 * modes, `tab` when the choice switches what the screen shows.
 */
export function Segment<T extends string>({
  label,
  options,
  value,
  onChange,
  kind = 'radio',
  block = false,
  testID,
}: {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  kind?: 'radio' | 'tab';
  /** Options share the full width. */
  block?: boolean;
  testID?: string;
}) {
  return (
    <View
      accessibilityRole={kind === 'tab' ? 'tablist' : 'radiogroup'}
      accessibilityLabel={label}
      testID={testID}
      className="flex-row flex-wrap gap-2"
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole={kind}
            accessibilityLabel={option.accessibilityLabel}
            accessibilityState={
              kind === 'tab' ? { selected: checked } : { checked }
            }
            aria-selected={kind === 'tab' ? checked : undefined}
            aria-checked={kind === 'radio' ? checked : undefined}
            testID={option.testID}
            onPress={() => {
              if (!checked) selectHaptic();
              onChange(option.value);
            }}
            className={cn(
              'min-h-11 flex-row items-center justify-center gap-2 rounded-full border-2 px-4 py-2 active:opacity-80 focus-visible:outline-[3px] focus-visible:outline-ring',
              block && 'min-w-28 flex-1',
              checked ? 'border-foreground/30 bg-muted' : 'border-line bg-card',
            )}
          >
            {typeof option.label === 'string' ? (
              <Text
                className={cn(
                  'text-center font-ui-bold text-sm',
                  checked ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {option.label}
              </Text>
            ) : (
              option.label
            )}
            {option.badge === undefined ? null : (
              <Text
                className={cn(
                  'min-w-6 rounded-full px-1.5 text-center font-ui-bold text-xs',
                  checked
                    ? 'bg-card text-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {option.badge}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
