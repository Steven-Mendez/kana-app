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
  // The status symbol belongs to the first line, not the whole centered block.
  const [status, ...details] = message.split('\n');
  const color = correct ? 'text-success' : 'text-error';
  return (
    <View
      testID="typing-feedback-slot"
      accessibilityLiveRegion="polite"
      className="w-full items-center"
      // Reserve two lines before grading; longer feedback can still grow.
      style={{ minHeight: 48 * fontScale }}
    >
      {message ? (
        <View testID="answer-feedback" className="max-w-full items-center">
          <View className="max-w-full flex-row items-center justify-center gap-2">
            {correct !== undefined ? (
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
            ) : null}
            <Text
              selectable
              className={`shrink text-center text-base leading-6 ${color}`}
            >
              {status}
            </Text>
          </View>
          {details.length ? (
            <Text
              selectable
              className={`text-center text-base leading-6 ${color}`}
            >
              {details.join('\n')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
