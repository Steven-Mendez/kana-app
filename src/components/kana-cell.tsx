import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { alphabetLabels, type KanaCard } from '@/data/kana';

/** Shared catalog medallion: browse in Syllabary, select in Practice. */
export function KanaCell({
  card,
  selected,
  onPress,
  selectable = false,
}: {
  card: KanaCard;
  selected: boolean;
  onPress: () => void;
  selectable?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={selectable ? 'checkbox' : 'button'}
      accessibilityLabel={`${card.kana}, ${card.reading}${selectable ? `, ${alphabetLabels[card.alphabet]}` : ''}`}
      aria-checked={selectable ? selected : undefined}
      accessibilityState={selectable ? { checked: selected } : { selected }}
      testID={`kana-${card.id}`}
      onPress={onPress}
      onKeyDown={
        process.env.EXPO_OS === 'web' && selectable
          ? (event) => {
              if (event.nativeEvent.key === ' ') {
                event.preventDefault();
                if (!event.nativeEvent.repeat) onPress();
              }
            }
          : undefined
      }
      className={`aspect-square min-w-11 w-full items-center justify-center rounded-full border active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring web:lg:max-w-16 ${selected ? 'border-primary bg-primary' : 'border-transparent bg-surface'}`}
    >
      {selectable && selected ? (
        <View className="absolute top-0 right-0 h-4 w-4 items-center justify-center rounded-full bg-primary">
          <Icon
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={10}
            color="primary-foreground"
          />
        </View>
      ) : null}
      <Text
        className={`text-2xl sm:text-3xl web:lg:text-2xl ${selected ? 'text-primary-foreground' : 'text-foreground'}`}
      >
        {card.kana}
      </Text>
      <Text
        className={`text-xs font-medium ${selected ? 'text-primary-foreground' : 'text-muted-foreground'}`}
      >
        {card.reading}
      </Text>
    </Pressable>
  );
}
