import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { alphabetLabels, type KanaCard, type KanaFamily } from '@/data/kana';
import { boardTile, vowelColumns, type BoardTile } from '@/lib/game-board';
import { pressHaptic, selectHaptic } from '@/lib/haptics';
import type { KanaProgress } from '@/lib/kana-mastery';
import { usePreferences } from '@/lib/preferences-provider';
import { cn } from '@/lib/utils';

/**
 * One kana as a square game tile: saved state, reading and a selected check.
 * Without a known state (progress failed to load) the tile stays neutral and
 * announces no state, so an error never reads as zero progress.
 */
export function KanaTile({
  tile,
  known = true,
  selected,
  onPress,
}: {
  tile: BoardTile;
  known?: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = usePreferences();
  const { card } = tile;
  const state = known ? tile.state : 'unseen';
  const stateLabel = known
    ? `, ${
        {
          mastered: t.homeBoardMastered,
          learning: t.homeBoardLevel(Math.round(tile.strength * 100)),
          unseen: t.homeBoardUnseen,
        }[state]
      }`
    : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.kana}, ${card.reading}${stateLabel}${selected ? `, ${t.inRound}` : ''}`}
      accessibilityState={{ selected }}
      testID={`kana-${card.id}`}
      onPress={() => {
        pressHaptic();
        onPress();
      }}
      className="aspect-square w-full max-w-20 rounded-tile active:scale-[0.97] focus-visible:outline-[3px] focus-visible:outline-ring"
    >
      <View
        className={cn(
          'flex-1 items-center justify-center overflow-hidden rounded-tile border-2',
          state === 'mastered'
            ? 'border-gold-lip bg-gold/25'
            : state === 'learning'
              ? 'border-line bg-card'
              : 'border-transparent bg-muted/60',
          selected && 'border-[3px] border-foreground',
        )}
      >
        <Text
          lang="ja"
          className={cn(
            'font-kana text-foreground',
            [...card.kana].length > 1 ? 'text-lg' : 'text-[22px]',
          )}
        >
          {card.kana}
        </Text>
        <Text className="font-ui text-xs text-muted-foreground">
          {card.reading}
        </Text>
        {state === 'learning' ? (
          <View className="absolute right-2 bottom-1 left-2 h-1 rounded-full bg-border">
            <View
              className="h-full rounded-full bg-tangerine"
              style={{ width: `${Math.round(tile.strength * 100)}%` }}
            />
          </View>
        ) : null}
      </View>
      {selected ? (
        <View className="absolute -top-2 -right-2 size-5 items-center justify-center rounded-full border-2 border-card bg-foreground">
          <Icon
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={10}
            color="background"
          />
        </View>
      ) : null}
    </Pressable>
  );
}

/** A family row: a one-touch checkbox and its kana in vowel columns. */
export function KanaRow({
  family,
  selectedIds,
  saved,
  onToggle,
  onOpen,
}: {
  family: KanaFamily;
  selectedIds: ReadonlySet<string>;
  /** Saved cards; null when progress could not be loaded. */
  saved?: ReadonlyMap<string, KanaProgress> | null;
  onToggle: (ids: string[]) => void;
  onOpen: (card: KanaCard) => void;
}) {
  const { fontScale } = useWindowDimensions();
  const yoon = family.section === 'yoon';
  const columns = family.label === 'n' ? ['n'] : vowelColumns(yoon);
  const cards =
    fontScale > 1.2
      ? family.cards
      : columns.map((vowel) =>
          family.cards.find((card) => card.reading.endsWith(vowel)),
        );
  return (
    <View className="flex-row items-center gap-1">
      <FamilyCheck
        family={family}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
      <View className="min-w-0 flex-1 flex-row flex-wrap gap-y-2">
        {cards.map((card, index) => (
          <View
            key={card?.id ?? columns[index]}
            testID={`cell-${family.id}-${columns[index] ?? index}`}
            className={cn('items-center px-1', yoon ? 'w-1/3' : 'w-1/5')}
            style={
              fontScale > 1.2
                ? { minWidth: (yoon ? 80 : 56) * fontScale }
                : undefined
            }
          >
            {card ? (
              <KanaTile
                tile={boardTile(card, saved?.get(card.id))}
                known={saved !== null}
                selected={selectedIds.has(card.id)}
                onPress={() => onOpen(card)}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function FamilyCheck({
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
  const ids = family.cards.map((card) => card.id);
  const toggle = () => {
    selectHaptic();
    onToggle(ids);
  };
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={`${t.family(alphabetLabels[family.alphabet], family.label)}, ${family.cards.map((card) => card.kana).join(' ')}: ${count}/${family.cards.length}`}
      aria-checked={checked}
      onPress={toggle}
      onKeyDown={
        process.env.EXPO_OS === 'web'
          ? (event) => {
              if (event.nativeEvent.key === ' ') {
                event.preventDefault();
                if (!event.nativeEvent.repeat) toggle();
              }
            }
          : undefined
      }
      testID={`family-${family.id}`}
      className="size-11 shrink-0 items-center justify-center rounded-xl active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <View
        className={cn(
          'size-7 items-center justify-center rounded-lg border-2',
          checked ? 'border-foreground bg-foreground' : 'border-line bg-card',
        )}
      >
        {checked ? (
          <Icon
            name={
              checked === 'mixed'
                ? { ios: 'minus', android: 'remove', web: 'remove' }
                : { ios: 'checkmark', android: 'check', web: 'check' }
            }
            size={14}
            color="background"
          />
        ) : null}
      </View>
    </Pressable>
  );
}
