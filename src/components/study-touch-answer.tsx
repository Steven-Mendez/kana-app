import { View } from 'react-native';

import { FeedbackBottomSheet } from '@/components/game/feedback-bottom-sheet';
import { GameButton } from '@/components/game/game-button';
import {
  RomajiOptionPill,
  type RomajiOptionState,
} from '@/components/game/romaji-option-pill';
import type { KanaCard } from '@/data/kana';
import { usePreferences } from '@/lib/preferences-provider';
import type { Grade } from '@/lib/study';

function coinState(
  coin: string,
  card: KanaCard,
  grade: Grade | undefined,
  selected: string | null,
): RomajiOptionState {
  if (!grade) return coin === selected ? 'selected' : 'default';
  if (coin === card.reading) return 'correct';
  if (coin === grade.answer) return 'wrong';
  return 'dimmed';
}

/** Coins instead of a keyboard; the screen owns the selection per prompt. */
export function StudyCoins({
  card,
  coins,
  grade,
  selected,
  onSelect,
}: {
  card: KanaCard;
  coins: readonly string[];
  grade?: Grade;
  selected: string | null;
  onSelect: (coin: string) => void;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      className="flex-row flex-wrap justify-center gap-4 pt-3"
    >
      {coins.map((coin, index) => (
        <RomajiOptionPill
          key={coin}
          romaji={coin}
          deal={card.id}
          index={index}
          testID={`coin-${coin}`}
          state={coinState(coin, card, grade, selected)}
          onPress={grade ? undefined : () => onSelect(coin)}
        />
      ))}
    </View>
  );
}

/**
 * The touch answer area at the bottom edge. Check grades the selected reading
 * through the same reducer as typing; Skip reveals. After grading, the ribbon
 * replaces the actions and its fill runs into the bottom safe area; a failed
 * save turns its button into Retry.
 */
export function StudyTouchActions({
  card,
  grade,
  combo,
  chosenKana,
  selected,
  bottomInset,
  continueDisabled,
  saveError,
  onCheck,
  onSkip,
  onContinue,
  onRetry,
}: {
  card: KanaCard;
  grade?: Grade;
  combo: number;
  chosenKana?: string;
  selected: string | null;
  bottomInset: number;
  continueDisabled: boolean;
  saveError: boolean;
  onCheck: (reading: string) => void;
  onSkip: () => void;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const { t } = usePreferences();
  if (grade)
    return (
      <View style={{ marginBottom: -bottomInset }}>
        <FeedbackBottomSheet
          testID="study-ribbon"
          tone={grade.correct ? 'correct' : 'wrong'}
          haptic={false}
          bottomInset={bottomInset}
          title={
            grade.correct
              ? combo >= 3
                ? t.gameComboTitle(combo)
                : t.gameNice
              : t.gameItWas(card.reading)
          }
          message={
            grade.correct
              ? t.gameReads(card.kana, card.reading)
              : grade.answer === null
                ? t.gameSkipped
                : t.gameChoseMessage(grade.answer, chosenKana)
          }
          continueLabel={
            saveError ? t.retry : grade.correct ? t.gameContinue : t.gameGotIt
          }
          continueTestID={saveError ? 'study-retry' : undefined}
          continueDisabled={!saveError && continueDisabled}
          onContinue={saveError ? onRetry : onContinue}
        />
      </View>
    );
  return (
    <View className="w-full max-w-lg flex-row gap-3 self-center px-4 pb-4 pt-2 sm:px-6">
      <View className="flex-1">
        <GameButton
          variant="secondary"
          block
          onPress={onSkip}
          testID="study-skip"
        >
          {t.gameSkip}
        </GameButton>
      </View>
      <View className="flex-1">
        <GameButton
          block
          disabled={selected === null}
          onPress={() => selected !== null && onCheck(selected)}
          testID="check-answer"
        >
          {t.check}
        </GameButton>
      </View>
    </View>
  );
}
