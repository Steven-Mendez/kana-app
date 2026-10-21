import { Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';

export function TypingFeedback({
  message,
  correct,
}: {
  message: string;
  correct?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  return (
    <View
      testID="typing-feedback-slot"
      accessibilityLiveRegion="polite"
      className="w-full flex-row items-start justify-center gap-2"
      // Reserve two lines before grading; longer feedback can still grow.
      style={{ minHeight: 48 * fontScale }}
    >
      {message ? (
        <>
          {correct !== undefined ? (
            <View className="pt-1">
              <Icon
                name={
                  correct
                    ? {
                        ios: 'checkmark.circle.fill',
                        android: 'check_circle',
                        web: 'check_circle',
                      }
                    : {
                        ios: 'xmark.circle.fill',
                        android: 'cancel',
                        web: 'cancel',
                      }
                }
                size={16}
                color={correct ? 'success' : 'error'}
              />
            </View>
          ) : null}
          <Text
            selectable
            testID="answer-feedback"
            className={`shrink text-center text-base leading-6 ${correct ? 'text-success' : 'text-error'}`}
          >
            {message}
          </Text>
        </>
      ) : null}
    </View>
  );
}
