import {
  AndroidHaptics,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  performAndroidHapticsAsync,
  selectionAsync,
} from 'expo-haptics';

// A light tap the moment a game piece presses down, never on release.
export function pressHaptic() {
  if (process.env.EXPO_OS === 'web') return;
  impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
}

// Haptics only accompany visible feedback, so unsupported devices stay silent.
export function answerHaptic(correct: boolean) {
  const signal =
    process.env.EXPO_OS === 'android'
      ? // System constants follow the user's haptic settings without VIBRATE.
        performAndroidHapticsAsync(
          correct ? AndroidHaptics.Confirm : AndroidHaptics.Reject,
        )
      : notificationAsync(
          correct
            ? NotificationFeedbackType.Success
            : NotificationFeedbackType.Error,
        );
  signal.catch(() => {});
}

// A selection tick when a choice changes (segments, tiles, checkboxes).
export function selectHaptic() {
  if (process.env.EXPO_OS === 'web') return;
  selectionAsync().catch(() => {});
}

// Once when a round's results appear, together with the stamp landing.
export function celebrateHaptic() {
  if (process.env.EXPO_OS === 'web') return;
  const signal =
    process.env.EXPO_OS === 'android'
      ? performAndroidHapticsAsync(AndroidHaptics.Confirm)
      : notificationAsync(NotificationFeedbackType.Success);
  signal.catch(() => {});
}
