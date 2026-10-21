import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
  primary?: boolean;
  disabled?: boolean;
  testID?: string;
};

export function Action({
  label,
  onPress,
  primary = false,
  disabled = false,
  testID,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      className={`min-h-12 min-w-11 items-center justify-center rounded-full px-5 py-3 active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${disabled ? 'bg-muted opacity-50' : primary ? 'bg-primary' : 'bg-transparent'}`}
    >
      <Text
        className={`text-center text-base font-medium ${primary && !disabled ? 'text-primary-foreground' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
