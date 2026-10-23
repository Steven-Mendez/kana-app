import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { CatalogGrid } from '@/components/catalog-grid';
import { KanaCell } from '@/components/kana-cell';
import { KanaStrokes } from '@/components/kana-strokes';
import { strokeGlyphs } from '@/lib/kana-strokes';
import { Action } from '@/components/action';
import { CatalogContent, CatalogControls } from '@/components/catalog-controls';
import { Screen } from '@/components/screen';
import { families, type Alphabet, type KanaFamily } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';

export default function SyllabaryScreen() {
  const { t } = usePreferences();
  const { selection, updateSelection } = useSelection();
  const { fontScale, height } = useWindowDimensions();
  const [alphabet, setAlphabet] = useState<Alphabet>('hiragana');
  const [category, setCategory] = useState<KanaFamily['section']>('basic');
  const [cardId, setCardId] = useState('');
  const visible = families.filter(
    (family) => family.alphabet === alphabet && family.section === category,
  );
  const card =
    visible
      .flatMap((family) => family.cards)
      .find((kana) => kana.id === cardId) ?? visible[0].cards[0];
  const columns =
    category === 'yoon' ? ['a', 'u', 'o'] : ['a', 'i', 'u', 'e', 'o'];
  return (
    <Screen navigation>
      <ScrollView contentContainerClassName="items-center">
        <CatalogContent>
          <CatalogControls
            title={t.syllabary}
            alphabet={alphabet}
            category={category}
            onAlphabetChange={setAlphabet}
            onCategoryChange={setCategory}
          />
          <CatalogGrid families={visible}>
            {(family) => {
              const cells =
                fontScale > 1.2
                  ? family.cards
                  : family.label === 'n'
                    ? [family.cards[0]]
                    : columns.map((vowel) =>
                        family.cards.find((kana) =>
                          kana.reading.endsWith(vowel),
                        ),
                      );
              return (
                <View key={family.id} className="flex-row flex-wrap gap-y-4">
                  {cells.map((kana, index) => (
                    <View
                      key={kana?.id ?? columns[index]}
                      className={`items-center px-1 ${category === 'yoon' ? 'w-1/3' : 'w-1/5'}`}
                      style={
                        fontScale > 1.2
                          ? { minWidth: 56 * fontScale }
                          : undefined
                      }
                    >
                      {kana ? (
                        <KanaCell
                          card={kana}
                          selected={card.id === kana.id}
                          onPress={() => setCardId(kana.id)}
                        />
                      ) : (
                        <View className="aspect-square w-full items-center justify-center web:lg:max-w-16">
                          <View className="h-1 w-1 rounded-full bg-border" />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            }}
          </CatalogGrid>
        </CatalogContent>
      </ScrollView>
      <ScrollView
        style={{ maxHeight: height * 0.4, flexGrow: 0, flexShrink: 0 }}
        contentContainerClassName="items-center"
        className="border-t border-border bg-surface"
      >
        <View className="w-full max-w-2xl gap-3 px-5 py-4 sm:px-6 web:lg:max-w-5xl web:lg:flex-row web:lg:items-center web:lg:justify-between">
          <View
            accessibilityLiveRegion="polite"
            className="flex-row items-center gap-4"
          >
            {strokeGlyphs(card.kana) ? (
              <KanaStrokes
                kana={card.kana}
                size={([...card.kana].length > 1 ? 64 : 96) * fontScale}
              />
            ) : (
              <Text className="text-4xl text-primary">{card.kana}</Text>
            )}
            <View className="flex-1 gap-1">
              <Text className="text-xs font-semibold tracking-wider text-muted-foreground">
                {t.readingLabel}
              </Text>
              <Text className="text-xl font-semibold text-foreground">
                {card.reading}
              </Text>
              {card.aliases.length ? (
                <Text className="text-sm text-muted-foreground">
                  {t.acceptedReadings}: {card.aliases.join(', ')}
                </Text>
              ) : null}
            </View>
          </View>
          <Action
            label={t.practiceFamily}
            disabled={!selection}
            primary
            onPress={() => {
              updateSelection(() => ({
                alphabet: card.alphabet,
                kanaIds: families
                  .filter((family) => family.id === card.familyId)
                  .flatMap((family) => family.cards.map((kana) => kana.id)),
              }));
              router.navigate({
                pathname: '/practice',
                params: { section: category },
              });
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
