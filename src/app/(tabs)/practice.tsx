import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { CatalogContent, CatalogControls } from '@/components/catalog-controls';
import { CatalogGrid } from '@/components/catalog-grid';
import { Action } from '@/components/action';
import { FamilyTile } from '@/components/family-tile';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { alphabetLabels, families } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { selectAlphabet, selectedCards, toggleKanaGroup } from '@/lib/study';

export default function PracticeScreen() {
  const { fontScale, height } = useWindowDimensions();
  const largeText = fontScale > 1.2;
  const { t } = usePreferences();
  const { selection, notice, updateSelection } = useSelection();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const category =
    section === 'voiced' || section === 'yoon' ? section : 'basic';
  const [mode, setMode] = useState<'scheduled' | 'free'>('scheduled');
  const [showModes, setShowModes] = useState(false);
  const modeControl = useRef<ComponentRef<typeof View>>(null);
  function chooseMode(value: 'scheduled' | 'free') {
    setMode(value);
    setShowModes(false);
    modeControl.current?.focus();
  }
  if (!selection) {
    return (
      <Screen navigation>
        <Text
          accessibilityRole="progressbar"
          className="p-6 text-base text-foreground"
        >
          {t.loading}
        </Text>
      </Screen>
    );
  }
  const selected = selectedCards(selection.kanaIds);
  const selectedIds = new Set(selection.kanaIds);
  const modeLabel = mode === 'scheduled' ? t.scheduledReview : t.freePractice;

  return (
    <Screen navigation>
      <ScrollView
        contentContainerClassName="items-center"
        keyboardShouldPersistTaps="handled"
      >
        <CatalogContent>
          <CatalogControls
            title={t.practice}
            alphabet={selection.alphabet}
            category={category}
            selectedCounts={{
              hiragana: selected.filter((card) => card.alphabet === 'hiragana')
                .length,
              katakana: selected.filter((card) => card.alphabet === 'katakana')
                .length,
            }}
            onAlphabetChange={(alphabet) =>
              updateSelection((current) => ({ ...current, alphabet }))
            }
            onCategoryChange={(section) => router.setParams({ section })}
          />
          {notice ? (
            <Text accessibilityRole="alert" className="text-sm text-error">
              {notice}
            </Text>
          ) : null}
          <View className="gap-3">
            <CatalogGrid
              selectable
              families={families.filter(
                (family) =>
                  family.alphabet === selection.alphabet &&
                  family.section === category,
              )}
            >
              {(family) => (
                <FamilyTile
                  key={family.id}
                  family={family}
                  selectedIds={selectedIds}
                  onToggle={(ids) =>
                    updateSelection((current) => ({
                      ...current,
                      kanaIds: toggleKanaGroup(current.kanaIds, ids),
                    }))
                  }
                />
              )}
            </CatalogGrid>
            <View className="items-center gap-2 border-t border-border pt-4">
              <Text className="text-center text-xs leading-5 text-muted-foreground">
                {t.allAlphabet(alphabetLabels[selection.alphabet])}
              </Text>
              <View
                className={
                  largeText
                    ? 'w-full gap-1'
                    : 'flex-row flex-wrap justify-center gap-2'
                }
              >
                <Action
                  label={t.selectAll}
                  testID="select-all"
                  onPress={() =>
                    updateSelection((current) => ({
                      ...current,
                      kanaIds: selectAlphabet(
                        current.kanaIds,
                        current.alphabet,
                        true,
                      ),
                    }))
                  }
                />
                <Action
                  label={t.clear}
                  testID="clear-selection"
                  onPress={() =>
                    updateSelection((current) => ({
                      ...current,
                      kanaIds: selectAlphabet(
                        current.kanaIds,
                        current.alphabet,
                        false,
                      ),
                    }))
                  }
                />
              </View>
            </View>
          </View>
        </CatalogContent>
      </ScrollView>

      <ScrollView
        testID="practice-footer"
        style={{ maxHeight: height * 0.55, flexGrow: 0, flexShrink: 0 }}
        contentContainerClassName="items-center"
        className="border-t border-border bg-background"
      >
        {showModes ? (
          <View testID="mode-options" className="w-full items-center">
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t.studyMode}
              className="w-full max-w-2xl gap-2 px-4 web:lg:max-w-5xl pt-3 pb-2 sm:px-6"
            >
              {(['scheduled', 'free'] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  aria-checked={mode === value}
                  testID={`mode-${value}`}
                  onPress={() => chooseMode(value)}
                  onKeyDown={
                    process.env.EXPO_OS === 'web'
                      ? (event) => {
                          if (event.nativeEvent.key === ' ') {
                            event.preventDefault();
                            if (!event.nativeEvent.repeat) chooseMode(value);
                          }
                        }
                      : undefined
                  }
                  className={`min-h-14 flex-row items-center justify-between gap-3 rounded-3xl border px-4 py-3 active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring ${mode === value ? 'border-primary bg-accent' : 'border-border bg-surface'}`}
                >
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      {value === 'scheduled'
                        ? t.scheduledReview
                        : t.freePractice}
                    </Text>
                    <Text className="text-sm leading-5 text-foreground">
                      {value === 'scheduled' ? t.scheduledHint : t.freeHint}
                    </Text>
                  </View>
                  {mode === value ? (
                    <Icon
                      name={{
                        ios: 'checkmark',
                        android: 'check',
                        web: 'check',
                      }}
                      size={18}
                      color="primary"
                    />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        <View
          className={`w-full max-w-2xl gap-x-3 web:lg:max-w-5xl gap-y-2 self-center px-4 py-3 sm:px-6 ${largeText ? '' : 'flex-row flex-wrap items-center justify-between'}`}
        >
          <View className={largeText ? 'w-full' : 'min-w-32 flex-1'}>
            <Text
              testID="selection-summary"
              accessibilityLabel={
                selected.length ? t.selected(selected.length) : t.emptySelection
              }
              accessibilityLiveRegion="polite"
              className="text-sm font-semibold text-foreground"
            >
              {selected.length
                ? largeText
                  ? `${selected.length} kana`
                  : t.selected(selected.length)
                : t.emptySelection}
            </Text>
            <Pressable
              ref={modeControl}
              accessibilityRole="button"
              accessibilityLabel={`${t.studyMode}: ${modeLabel}`}
              accessibilityState={{ expanded: showModes }}
              testID="study-mode"
              onPress={() => setShowModes(!showModes)}
              className="min-h-11 flex-row items-center gap-1 self-start rounded-xl py-1 active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Text className="shrink text-sm text-muted-foreground">
                {modeLabel}
              </Text>
              <Icon
                name={
                  showModes
                    ? {
                        ios: 'chevron.down',
                        android: 'expand_more',
                        web: 'expand_more',
                      }
                    : {
                        ios: 'chevron.up',
                        android: 'expand_less',
                        web: 'expand_less',
                      }
                }
                size={16}
              />
            </Pressable>
          </View>
          <Action
            label={t.startShort}
            testID="start-study"
            primary
            disabled={!selected.length}
            onPress={() =>
              router.navigate({
                pathname: '/study',
                params: {
                  kana: JSON.stringify(selected.map((card) => card.id)),
                  mode,
                },
              })
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
