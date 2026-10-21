import type { PropsWithChildren } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import {
  alphabetLabels,
  alphabets,
  sections,
  type Alphabet,
  type KanaFamily,
} from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';

type Category = KanaFamily['section'];

export function CatalogContent({ children }: PropsWithChildren) {
  return (
    <View className="w-full max-w-2xl gap-5 web:lg:max-w-5xl px-4 pt-2 pb-8 sm:px-6 sm:pt-6">
      {children}
    </View>
  );
}

/** One geometry for browsing and selection, including enlarged text. */
export function CatalogControls({
  title,
  alphabet,
  category,
  onAlphabetChange,
  onCategoryChange,
  selectedCounts,
}: {
  title: string;
  alphabet: Alphabet;
  category: Category;
  onAlphabetChange: (alphabet: Alphabet) => void;
  onCategoryChange: (category: Category) => void;
  selectedCounts?: Record<Alphabet, number>;
}) {
  const { t } = usePreferences();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale > 1.2;
  return (
    <View className="gap-5">
      {process.env.EXPO_OS === 'web' ? (
        <Text
          accessibilityRole="header"
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          {title}
        </Text>
      ) : null}
      <View className="gap-5 web:lg:flex-row web:lg:items-center web:lg:justify-between">
        <View
          accessibilityRole="tablist"
          accessibilityLabel={t.alphabet}
          testID="catalog-alphabets"
          className={`gap-1 rounded-3xl bg-muted p-1 web:lg:w-96 ${largeText ? '' : 'flex-row flex-wrap'}`}
        >
          {alphabets.map((value) => {
            const active = alphabet === value;
            const count = selectedCounts?.[value];
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityLabel={
                  count === undefined
                    ? alphabetLabels[value]
                    : `${alphabetLabels[value]} · ${count}`
                }
                accessibilityHint={
                  count === undefined ? undefined : t.selected(count)
                }
                aria-selected={active}
                testID={`alphabet-${value}`}
                onPress={() => onAlphabetChange(value)}
                className={`min-h-16 flex-row items-center justify-center gap-2 rounded-3xl px-2 py-3 active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring ${largeText ? '' : 'min-w-28 flex-1'} ${active ? 'bg-surface' : ''}`}
              >
                <Text
                  className={`text-3xl ${active ? 'text-primary' : 'text-foreground'}`}
                >
                  {value === 'hiragana' ? 'あ' : 'ア'}
                </Text>
                <Text
                  className={`text-base font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {alphabetLabels[value]}
                </Text>
                {count === undefined ? null : (
                  <Text className="absolute top-1 right-1 min-w-4 web:lg:static rounded-full bg-muted px-1 text-center text-xs font-semibold text-foreground">
                    {count}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
        <View
          accessibilityRole="tablist"
          accessibilityLabel={t.category}
          testID="catalog-categories"
          className={`gap-2 web:lg:w-96 ${largeText ? '' : 'flex-row flex-wrap'}`}
        >
          {sections.map(({ id }) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityLabel={t[id]}
              aria-selected={category === id}
              testID={`category-${id}`}
              onPress={() => onCategoryChange(id)}
              className={`min-h-11 items-center justify-center rounded-full border px-3 py-2 active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring ${largeText ? '' : 'min-w-20 flex-1'} ${category === id ? 'border-primary bg-accent' : 'border-transparent bg-muted'}`}
            >
              <Text className="text-center text-sm font-semibold text-foreground">
                {t[id]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {largeText ? null : (
        <View
          accessible={false}
          className={`flex-row web:lg:hidden ${selectedCounts ? 'pl-12' : ''}`}
        >
          {(category === 'yoon'
            ? ['A', 'U', 'O']
            : ['A', 'I', 'U', 'E', 'O']
          ).map((vowel) => (
            <Text
              key={vowel}
              className={`text-center text-xs font-bold text-muted-foreground ${category === 'yoon' ? 'w-1/3' : 'w-1/5'}`}
            >
              {vowel}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
