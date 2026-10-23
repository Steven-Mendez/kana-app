import {
  GameButton,
  type GameButtonVariant,
} from '@/components/game/game-button';

type Props = {
  label: string;
  onPress?: () => void;
  primary?: boolean;
  /** Overrides `primary`; `quiet` for secondary admin actions. */
  variant?: GameButtonVariant;
  disabled?: boolean;
  testID?: string;
};

/** A labelled action in the game look: primary, or an outlined secondary. */
export function Action({
  label,
  onPress,
  primary = false,
  variant,
  disabled = false,
  testID,
}: Props) {
  return (
    <GameButton
      variant={variant ?? (primary ? 'primary' : 'secondary')}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      {label}
    </GameButton>
  );
}
