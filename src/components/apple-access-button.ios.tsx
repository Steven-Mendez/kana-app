import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from 'expo-apple-authentication';
import { View } from 'react-native';

import { usePreferences } from '@/lib/preferences-provider';

export function AppleAccessButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { preferences } = usePreferences();
  return (
    <View
      pointerEvents={disabled ? 'none' : 'auto'}
      className={disabled ? 'opacity-50' : ''}
    >
      <AppleAuthenticationButton
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        buttonType={AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={
          preferences.theme === 'dark'
            ? AppleAuthenticationButtonStyle.WHITE
            : AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={24}
        style={{ width: '100%', height: 48 }}
        onPress={() => {
          if (!disabled) onPress();
        }}
      />
    </View>
  );
}
