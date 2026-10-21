import { Text, View } from 'react-native';

import { alphabetLabels, type KanaCard } from '@/data/kana';

export function TypingPrompt({
  card,
  height,
  fontSize,
  correct,
  onLabelHeight,
}: {
  card: KanaCard;
  height: number;
  fontSize: number;
  correct?: boolean;
  onLabelHeight: (height: number) => void;
}) {
  return (
    <View
      testID="typing-prompt-area"
      style={{ height }}
      className="items-center justify-center gap-1"
    >
      <Text
        onLayout={(event) => onLabelHeight(event.nativeEvent.layout.height)}
        className="text-sm font-medium text-muted-foreground"
      >
        {alphabetLabels[card.alphabet]}
      </Text>
      <Text
        accessibilityLabel={`${alphabetLabels[card.alphabet]}: ${card.kana}`}
        testID="study-prompt"
        numberOfLines={1}
        // The parent sizes the glyph to the keyboard-reduced viewport.
        allowFontScaling={false}
        adjustsFontSizeToFit
        minimumFontScale={0.33}
        style={{ fontSize, lineHeight: fontSize * 1.25 }}
        className={`max-w-full text-center ${correct === undefined ? 'text-foreground' : correct ? 'text-success' : 'text-error'}`}
      >
        {card.kana}
      </Text>
    </View>
  );
}
