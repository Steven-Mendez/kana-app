import { Pressable, useWindowDimensions, View } from 'react-native';

import { KanaCell } from '@/components/kana-cell';
import { Icon } from '@/components/icon';
import { alphabetLabels, type KanaFamily } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';

export function FamilyTile({
  family,
  selectedIds,
  onToggle,
}: {
  family: KanaFamily;
  selectedIds: ReadonlySet<string>;
  onToggle: (ids: string[]) => void;
}) {
  const { fontScale } = useWindowDimensions();
  const compound = family.section === 'yoon';
  const columns =
    family.label === 'n'
      ? ['n']
      : compound
        ? ['a', 'u', 'o']
        : ['a', 'i', 'u', 'e', 'o'];
  const cards =
    fontScale > 1.2
      ? family.cards
      : columns.map((vowel) =>
          family.cards.find((card) => card.reading.endsWith(vowel)),
        );
  return (
    <View className="flex-row items-start gap-1">
      <FamilyToggle
        family={family}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
      <View className="min-w-0 flex-1 flex-row flex-wrap gap-y-4">
        {cards.map((card, index) => {
          const selected = card ? selectedIds.has(card.id) : false;
          return (
            <View
              key={card?.id ?? columns[index]}
              testID={`cell-${family.id}-${columns[index] ?? index}`}
              className={`items-center px-0.5 ${compound ? 'w-1/3' : 'w-1/5'}`}
              style={
                fontScale > 1.2
                  ? { minWidth: (compound ? 80 : 56) * fontScale }
                  : undefined
              }
            >
              {card ? (
                <KanaCell
                  card={card}
                  selected={selected}
                  selectable
                  onPress={() => onToggle([card.id])}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FamilyToggle({
  family,
  selectedIds,
  onToggle,
}: {
  family: KanaFamily;
  selectedIds: ReadonlySet<string>;
  onToggle: (ids: string[]) => void;
}) {
  const { t } = usePreferences();
  const count = family.cards.filter((card) => selectedIds.has(card.id)).length;
  const checked =
    count === family.cards.length ? true : count ? 'mixed' : false;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={`${t.family(alphabetLabels[family.alphabet], family.label)}, ${family.cards.map((card) => card.kana).join(' ')}: ${count}/${family.cards.length}`}
      aria-checked={checked}
      onPress={() => onToggle(family.cards.map((card) => card.id))}
      onKeyDown={
        process.env.EXPO_OS === 'web'
          ? (event) => {
              if (event.nativeEvent.key === ' ') {
                event.preventDefault();
                if (!event.nativeEvent.repeat)
                  onToggle(family.cards.map((card) => card.id));
              }
            }
          : undefined
      }
      testID={`family-${family.id}`}
      className="mt-2 min-h-11 w-11 shrink-0 items-center justify-center rounded-xl active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring sm:mt-4"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-md border ${checked ? 'border-primary bg-primary' : 'border-muted-foreground'}`}
      >
        {checked ? (
          <Icon
            name={
              checked === 'mixed'
                ? { ios: 'minus', android: 'remove', web: 'remove' }
                : { ios: 'checkmark', android: 'check', web: 'check' }
            }
            size={12}
            color="primary-foreground"
          />
        ) : null}
      </View>
    </Pressable>
  );
}
