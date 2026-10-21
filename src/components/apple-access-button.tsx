import { Action } from '@/components/action';

export function AppleAccessButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return <Action label={label} disabled={disabled} onPress={onPress} />;
}
