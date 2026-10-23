import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption } from '@/components/game/comic';
import { GameButton } from '@/components/game/game-button';
import { Icon } from '@/components/icon';
import { KanaStrokes } from '@/components/kana-strokes';
import { alphabetLabels, type KanaCard } from '@/data/kana';
import { boardTile } from '@/lib/game-board';
import { selectHaptic } from '@/lib/haptics';
import { cappedToday, isMastered, type KanaProgress } from '@/lib/kana-mastery';
import { strokeGlyphs } from '@/lib/kana-strokes';
import { usePreferences } from '@/lib/preferences-provider';

/**
 * A kana up close: stroke order, readings and saved state, with the two
 * actions that change the selection. Opening it never changes the selection.
 */
export function KanaSheet({
  card,
  saved,
  known = true,
  selected,
  onToggle,
  onPracticeFamily,
  onClose,
}: {
  card: KanaCard | null;
  saved?: KanaProgress;
  /** False when progress failed to load: the saved state is then unknown. */
  known?: boolean;
  selected: boolean;
  onToggle: () => void;
  onPracticeFamily: () => void;
  onClose: () => void;
}) {
  const { t, preferences } = usePreferences();
  const insets = useSafeAreaInsets();
  const [now] = useState(() => new Date());
  const tile = card ? boardTile(card, saved) : null;
  // Why a kana's bar may not move today, or when a mastered one returns.
  const note =
    known && saved
      ? isMastered(saved)
        ? t.nextReview(saved.due.toLocaleDateString(preferences.language))
        : cappedToday(saved, now)
          ? t.masteryCappedToday
          : null
      : null;
  return (
    <Modal
      visible={!!card}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.closeSheet}
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
        />
        {card && tile ? (
          <View
            testID="kana-sheet"
            className="w-full max-w-2xl gap-4 self-center rounded-t-[28px] bg-card px-5 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
          >
            <View className="flex-row items-center justify-between">
              <Caption>
                {alphabetLabels[card.alphabet]}
                {known
                  ? ` · ${
                      {
                        mastered: t.homeBoardMastered,
                        learning: t.homeBoardLevel(
                          Math.round(tile.strength * 100),
                        ),
                        unseen: t.homeBoardUnseen,
                      }[tile.state]
                    }`
                  : null}
              </Caption>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.closeSheet}
                testID="kana-sheet-close"
                onPress={onClose}
                className="size-11 items-center justify-center rounded-full bg-muted active:opacity-70"
              >
                <Icon
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={16}
                />
              </Pressable>
            </View>
            <View
              accessibilityLiveRegion="polite"
              className="flex-row items-center gap-5"
            >
              {strokeGlyphs(card.kana) ? (
                <KanaStrokes
                  kana={card.kana}
                  size={[...card.kana].length > 1 ? 80 : 120}
                />
              ) : (
                <Text lang="ja" className="font-kana text-6xl text-foreground">
                  {card.kana}
                </Text>
              )}
              <View className="flex-1 gap-1">
                <Text className="font-ui-bold text-xs tracking-wider text-muted-foreground">
                  {t.readingLabel}
                </Text>
                <Text className="font-display text-3xl text-foreground">
                  {card.reading}
                </Text>
                {card.aliases.length ? (
                  <Text className="font-ui text-[13px] text-muted-foreground">
                    {t.acceptedReadings}: {card.aliases.join(', ')}
                  </Text>
                ) : null}
                {note ? (
                  <Text
                    testID="kana-sheet-note"
                    className="font-ui text-[13px] text-muted-foreground"
                  >
                    {note}
                  </Text>
                ) : null}
              </View>
            </View>
            <GameButton
              block
              variant={selected ? 'secondary' : 'primary'}
              testID="kana-toggle"
              onPress={() => {
                selectHaptic();
                onToggle();
              }}
            >
              {selected ? t.excludeKana : t.includeKana}
            </GameButton>
            <GameButton
              block
              variant="outline"
              testID="practice-family"
              onPress={onPracticeFamily}
            >
              {t.practiceFamily}
            </GameButton>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
