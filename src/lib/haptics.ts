import {
  AndroidHaptics,
  NotificationFeedbackType,
  notificationAsync,
  performAndroidHapticsAsync,
} from 'expo-haptics';

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
