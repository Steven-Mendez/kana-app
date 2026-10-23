import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ScreenTitle } from '@/components/game/comic';
import { GameButton } from '@/components/game/game-button';
import { Skeleton, TextAction } from '@/components/game/layout';
import { Meter } from '@/components/game/meter';
import { Segment } from '@/components/game/segment';
import { KanaRow } from '@/components/kana-board';
import { KanaSheet } from '@/components/kana-sheet';
import { Screen } from '@/components/screen';
import {
  alphabetLabels,
  alphabets,
  families,
  sections,
  type KanaCard,
  type KanaFamily,
} from '@/data/kana';
import { vowelColumns } from '@/lib/game-board';
import { roundLength } from '@/lib/game-score';
import { usePreferences } from '@/lib/preferences-provider';
import { useSelection } from '@/lib/selection-provider';
import { selectAlphabet, selectedCards, toggleKanaGroup } from '@/lib/study';
import { selectHaptic } from '@/lib/haptics';
import { useStudyProgress } from '@/lib/use-study-progress';
import { cn } from '@/lib/utils';

type Category = KanaFamily['section'];

/** Learn and pick kana: one table for both, coloured by saved progress. */
export default function KanaScreen() {
  const { fontScale, height, width } = useWindowDimensions();
  const { t } = usePreferences();
  const { selection, notice, updateSelection } = useSelection();
  const progress = useStudyProgress();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const category: Category =
    section === 'voiced' || section === 'yoon' ? section : 'basic';
  const [open, setOpen] = useState<KanaCard | null>(null);
  if (!selection) {
    return (
      <Screen navigation title={t.kanaTitle}>
        <View className="w-full max-w-2xl gap-6 self-center px-4 pt-1 sm:px-6 sm:pt-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <TableSkeleton label={t.loading} />
        </View>
      </Screen>
    );
  }
  const selected = selectedCards(selection.kanaIds);
  const selectedIds = new Set(selection.kanaIds);
  const toggle = (ids: string[]) =>
    updateSelection((current) => ({
      ...current,
      kanaIds: toggleKanaGroup(current.kanaIds, ids),
    }));
  const coverage = progress.data?.alphabets.find(
    (entry) => entry.alphabet === selection.alphabet,
  );
  const largeText = fontScale > 1.2;
  const known = progress.status !== 'error';
  return (
    <Screen navigation title={t.kanaTitle}>
      <ScrollView
        contentContainerClassName="items-center"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-2xl gap-5 px-4 pt-1 pb-8 sm:px-6 sm:pt-6">
          {width >= 768 ? <ScreenTitle>{t.kanaTitle}</ScreenTitle> : null}
          <Segment
            kind="tab"
            block
            label={t.alphabet}
            testID="catalog-alphabets"
            value={selection.alphabet}
            onChange={(alphabet) =>
              updateSelection((current) => ({ ...current, alphabet }))
            }
            options={alphabets.map((alphabet) => {
              const count = selected.filter(
                (card) => card.alphabet === alphabet,
              ).length;
              return {
                value: alphabet,
                testID: `alphabet-${alphabet}`,
                accessibilityLabel: `${alphabetLabels[alphabet]} · ${count}`,
                badge: count,
                label: (
                  <Text
                    className={`font-ui-bold text-base ${selection.alphabet === alphabet ? 'text-accent-foreground' : 'text-foreground'}`}
                  >
                    <Text lang="ja" className="font-kana">
                      {alphabet === 'hiragana' ? 'あ' : 'ア'}
                    </Text>{' '}
                    {alphabetLabels[alphabet]}
                  </Text>
                ),
              };
            })}
          />
          {coverage ? (
            <View className="gap-2">
              <Text className="font-ui-bold text-[13px] text-foreground">
                {t.coverage(coverage.reviewed, coverage.total)}
              </Text>
              <Meter
                value={coverage.reviewed}
                total={coverage.total}
                label={alphabetLabels[selection.alphabet]}
              />
            </View>
          ) : null}
          {progress.status === 'error' ? (
            <View
              accessibilityRole="alert"
              testID="progress-error"
              className="flex-row flex-wrap items-center gap-x-3"
            >
              <Text className="shrink font-ui text-[13px] text-muted-foreground">
                {t.reviewLoadError}
              </Text>
              <TextAction
                label={t.retry}
                testID="progress-retry"
                onPress={progress.refresh}
              />
            </View>
          ) : null}
          <CategoryTabs
            label={t.category}
            value={category}
            onChange={(next) => router.setParams({ section: next })}
            options={sections.map(({ id }) => ({ value: id, label: t[id] }))}
          />
          {notice ? (
            <Text
              accessibilityRole="alert"
              className="font-ui text-[13px] text-error"
            >
              {notice}
            </Text>
          ) : null}
          {progress.status === 'loading' ? (
            <TableSkeleton label={t.loading} />
          ) : (
            <View className="gap-2">
              {largeText ? null : (
                <View accessible={false} className="flex-row pl-12">
                  {vowelColumns(category === 'yoon').map((vowel) => (
                    <Text
                      key={vowel}
                      className={`text-center font-ui-bold text-xs text-muted-foreground uppercase ${category === 'yoon' ? 'w-1/3' : 'w-1/5'}`}
                    >
                      {vowel}
                    </Text>
                  ))}
                </View>
              )}
              {families
                .filter(
                  (family) =>
                    family.alphabet === selection.alphabet &&
                    family.section === category,
                )
                .map((family) => (
                  <KanaRow
                    key={family.id}
                    family={family}
                    selectedIds={selectedIds}
                    saved={known ? (progress.saved ?? undefined) : null}
                    onToggle={toggle}
                    onOpen={setOpen}
                  />
                ))}
            </View>
          )}
          <View className="items-center gap-3">
            <Text className="text-center font-ui text-[13px] text-muted-foreground">
              {t.allAlphabet(alphabetLabels[selection.alphabet])}
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3">
              <GameButton
                variant="secondary"
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
              >
                {t.selectAll}
              </GameButton>
              <GameButton
                variant="outline"
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
              >
                {t.clear}
              </GameButton>
            </View>
          </View>
        </View>
      </ScrollView>
      <ScrollView
        testID="practice-footer"
        style={{ maxHeight: height * 0.45, flexGrow: 0, flexShrink: 0 }}
        contentContainerClassName="items-center"
        className="border-t border-foreground/10 bg-background"
      >
        <View className="w-full max-w-2xl gap-3 px-4 py-3 sm:px-6">
          <View className="gap-1">
            <Text
              testID="selection-summary"
              accessibilityLabel={
                selected.length ? t.selected(selected.length) : t.emptySelection
              }
              accessibilityLiveRegion="polite"
              className="font-ui-bold text-base text-foreground"
            >
              {selected.length ? t.selected(selected.length) : t.emptySelection}
            </Text>
            <Text className="font-ui text-[13px] text-muted-foreground">
              {t.scheduledHint}
            </Text>
          </View>
          <GameButton
            block
            testID="start-study"
            disabled={!selected.length}
            onPress={() =>
              router.navigate({
                pathname: '/study',
                params: {
                  kana: JSON.stringify(selected.map((card) => card.id)),
                  mode: 'scheduled',
                },
              })
            }
          >
            {t.startShort}
          </GameButton>
        </View>
      </ScrollView>
      <KanaSheet
        card={open}
        saved={open ? progress.saved?.get(open.id) : undefined}
        known={known}
        selected={open ? selectedIds.has(open.id) : false}
        onClose={() => setOpen(null)}
        onToggle={() => open && toggle([open.id])}
        onPracticeFamily={() => {
          if (!open) return;
          const ids = families
            .filter((family) => family.id === open.familyId)
            .flatMap((family) => family.cards.map((kana) => kana.id));
          updateSelection(() => ({ alphabet: open.alphabet, kanaIds: ids }));
          setOpen(null);
          router.navigate({
            pathname: '/study',
            params: {
              kana: JSON.stringify(ids),
              mode: 'scheduled',
              length: String(roundLength),
            },
          });
        }}
      />
    </Screen>
  );
}

/** Category tabs: a light underline row, quieter than the alphabet switch. */
function CategoryTabs({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Category;
  options: { value: Category; label: string }[];
  onChange: (value: Category) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      testID="catalog-categories"
      className="flex-row gap-6 border-b border-foreground/[0.07]"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            testID={`category-${option.value}`}
            onPress={() => {
              if (active) return;
              selectHaptic();
              onChange(option.value);
            }}
            className="min-h-11 justify-center active:opacity-60 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Text
              numberOfLines={1}
              className={cn(
                'font-ui-bold text-[15px]',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {option.label}
            </Text>
            <View
              className={cn(
                'absolute right-0 -bottom-px left-0 h-0.5 rounded-full',
                active ? 'bg-foreground' : 'bg-transparent',
              )}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Rows of placeholder tiles shaped like the kana table. */
function TableSkeleton({ label }: { label: string }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      testID="kana-skeleton"
      className="gap-2"
    >
      {[0, 1, 2, 3, 4].map((row) => (
        <View key={row} className="flex-row items-center gap-1">
          <View className="size-11 items-center justify-center">
            <Skeleton className="size-7" />
          </View>
          <View className="flex-1 flex-row">
            {[0, 1, 2, 3, 4].map((cell) => (
              <View key={cell} className="w-1/5 items-center px-1">
                <Skeleton className="aspect-square w-full max-w-20 rounded-tile" />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
