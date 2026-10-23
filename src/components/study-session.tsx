import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  AnimatedProgressBar,
  CloseButton,
} from '@/components/game/animated-progress-bar';
import { GameButton } from '@/components/game/game-button';
import { KanaCard as KanaCardView } from '@/components/game/kana-card';
import { Screen } from '@/components/screen';
import { TextAction } from '@/components/game/layout';
import { StudyProgress } from '@/components/study-progress';
import { StudyResults } from '@/components/study-results';
import { StudyCoins, StudyTouchActions } from '@/components/study-touch-answer';
import { TypingFeedback } from '@/components/typing-feedback';
import { alphabetLabels, type KanaCard } from '@/data/kana';
import { confusedCard } from '@/lib/confusions';
import { coinChoices } from '@/lib/game-choices';
import type { DailyStreak } from '@/lib/game-streak';
import { answerHaptic } from '@/lib/haptics';
import type { InputMode } from '@/lib/input-mode';
import {
  cappedToday,
  hydrateProgress,
  isMastered,
  ratingForAnswer,
  type KanaProgress,
} from '@/lib/kana-mastery';
import { nextPracticeCard } from '@/lib/practice-sampling';
import { usePreferences } from '@/lib/preferences-provider';
import type { ReviewRequest, StoredProgress } from '@/lib/review-storage';
import { answerSound, prepareSounds } from '@/lib/sounds';
import {
  acceptsAnswer,
  createRound,
  roundScore,
  studyReducer,
  type StudyAction,
} from '@/lib/study';

// Typing moves on after a short beat; touch rounds hold the correct ribbon
// until Continue so the celebration is seen, not cut off mid-flight.
const FEEDBACK_MS = 250;

export function StudySession({
  cards,
  onCommitReview,
  progress,
  length,
  inputMode = 'keyboard',
  confusedWith,
  onConfusion,
  streak,
}: {
  cards: KanaCard[];
  progress?: ReadonlyMap<string, KanaProgress>;
  onCommitReview?: (request: ReviewRequest) => Promise<StoredProgress | void>;
  /** Graded answers in a finite round; endless when omitted. */
  length?: number;
  inputMode?: InputMode;
  confusedWith?: (cardId: string) => string[];
  onConfusion?: (cardId: string, confusedId: string) => void;
  /** The daily streak before this round and now, for the results celebration. */
  streak?: { before: DailyStreak; after: DailyStreak };
}) {
  const { t, preferences } = usePreferences();
  const insets = useSafeAreaInsets();
  const placeholderColor = useCSSVariable('--color-muted-foreground');
  const selectionColor = useCSSVariable('--color-ring');
  const [round, setRound] = useState(() =>
    createRound([nextPracticeCard(cards, [], progress)], cards, false),
  );
  const currentRound = useRef(round);
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const pendingReview = useRef<ReviewRequest | null>(null);
  const feedbackUntil = useRef(0);
  const saving = useRef(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  // The saved level of the kana just answered, shown once its save succeeds.
  const [savedLevel, setSavedLevel] = useState<string | null>(null);
  const [timing, setTiming] = useState(() => ({
    started: Date.now(),
    finished: 0,
  }));
  const touch = inputMode === 'touch';
  const card = round.deck[round.index];
  const grade = round.grades[round.index];
  const score = roundScore(round);
  const coins = useMemo(
    () =>
      touch
        ? coinChoices(
            card,
            confusedWith?.(card.id),
            round.original.map((other) => other.id),
          )
        : [],
    // A new prompt (even of the same kana) gets fresh coins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card.id, round.index, round.deck],
  );
  // The selected coin belongs to one prompt; a new prompt starts empty.
  const [picked, setPicked] = useState<{
    deck: KanaCard[];
    index: number;
    coin: string;
  } | null>(null);
  const selectedCoin =
    picked && picked.deck === round.deck && picked.index === round.index
      ? picked.coin
      : null;
  const gradeLabel = grade?.correct
    ? t.correct
    : grade?.answer === null
      ? t.revealed
      : t.incorrect;
  const feedback = grade
    ? `${gradeLabel}. ${t.reading(card.kana, card.reading)}${!grade.correct && grade.answer !== null ? ` ${t.yourAnswer(grade.answer)}` : ''}`
    : round.needsAnswer
      ? t.needsAnswer
      : '';
  const chosenKana =
    grade && !grade.correct
      ? confusedCard(card, grade.answer)?.kana
      : undefined;

  // Update the event guard synchronously, before React renders another handler.
  const dispatch = useCallback(
    (action: StudyAction) => {
      const current = currentRound.current;
      if (current.deck !== round.deck || current.index !== round.index)
        return null;
      const next = studyReducer(current, action);
      currentRound.current = next;
      setRound(next);
      return next;
    },
    [round.deck, round.index],
  );

  const finish = useCallback(() => {
    if (!dispatch({ type: 'finish' })) return;
    setTiming((value) => ({ ...value, finished: Date.now() }));
  }, [dispatch]);

  const restart = useCallback(
    (next: ReturnType<typeof createRound>) => {
      if (!dispatch({ type: 'restart', round: next })) return;
      setTiming({ started: Date.now(), finished: 0 });
    },
    [dispatch],
  );

  const advance = useCallback(() => {
    if (
      !grade ||
      currentRound.current.grades[currentRound.current.index] !== grade ||
      (onCommitReview && saveStatus !== 'saved')
    )
      return;
    // A finite round ends once its last answer is resolved (and saved).
    if (length && currentRound.current.grades.length >= length) {
      pendingReview.current = null;
      setSaveStatus('idle');
      finish();
      return;
    }
    if (
      !dispatch({
        type: 'next',
        cardId: card.id,
        nextCard: nextPracticeCard(round.original, round.grades, progress),
      })
    )
      return;
    pendingReview.current = null;
    setSaveStatus('idle');
    input.current?.focus();
  }, [
    grade,
    round.original,
    round.grades,
    progress,
    onCommitReview,
    saveStatus,
    dispatch,
    card.id,
    length,
    finish,
  ]);

  const hasNextInput = round.nextInput;
  useEffect(() => {
    if (
      round.finished ||
      touch ||
      !grade?.correct ||
      (onCommitReview && saveStatus !== 'saved')
    )
      return;
    const timer = setTimeout(
      advance,
      hasNextInput ? 0 : Math.max(0, feedbackUntil.current - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [
    advance,
    grade,
    hasNextInput,
    onCommitReview,
    round.finished,
    saveStatus,
    touch,
  ]);

  useEffect(() => {
    prepareSounds();
    return () => {
      pendingReview.current = null;
    };
  }, []);

  useEffect(() => {
    if (feedback && process.env.EXPO_OS === 'ios')
      AccessibilityInfo.announceForAccessibility(feedback);
  }, [feedback]);

  const saveReview = useCallback(async () => {
    if (
      !onCommitReview ||
      !pendingReview.current ||
      saving.current ||
      currentRound.current.deck !== round.deck ||
      currentRound.current.index !== round.index
    )
      return;
    saving.current = true;
    input.current?.focus();
    const request = pendingReview.current;
    setSaveStatus('saving');
    try {
      const result = await onCommitReview(request);
      if (pendingReview.current === request) {
        if (result) {
          const saved = hydrateProgress(result.mastery);
          const kana = request.cardId.split(':')[1];
          setSavedLevel(
            isMastered(saved)
              ? t.masteryMastered(kana)
              : cappedToday(saved, request.reviewedAt)
                ? t.masteryCapped(kana, saved.level)
                : t.masteryLevel(kana, saved.level),
          );
        } else setSavedLevel(null);
        setSaveStatus('saved');
      }
    } catch {
      if (pendingReview.current === request) setSaveStatus('error');
    } finally {
      saving.current = false;
    }
  }, [onCommitReview, round.deck, round.index, t]);

  const answer = useCallback(
    (action: StudyAction) => {
      const previousGrade =
        currentRound.current.grades[currentRound.current.index];
      const next = dispatch(action);
      if (!next) return;
      input.current?.focus();
      const result = next.grades[round.index];
      if (!result || previousGrade) return;
      answerHaptic(result.correct);
      answerSound(result.correct, roundScore(next).streak);
      feedbackUntil.current = Date.now() + FEEDBACK_MS;
      const confused = result.correct
        ? null
        : confusedCard(card, result.answer);
      if (confused) onConfusion?.(card.id, confused.id);
      if (!onCommitReview) return;
      const reviewedAt = new Date();
      pendingReview.current = {
        id: randomUUID(),
        cardId: card.id,
        rating: ratingForAnswer(result.correct),
        reviewedAt,
      };
      void saveReview();
    },
    [dispatch, round.index, card, onConfusion, onCommitReview, saveReview],
  );

  // A coin answers like a typed draft: an accepted reading grades on input,
  // anything else is confirmed as a mistake right away.
  const answerCoin = useCallback(
    (reading: string) => {
      answer({ type: 'input', cardId: card.id, value: reading });
      if (!currentRound.current.grades[currentRound.current.index])
        answer({ type: 'submit', cardId: card.id });
    },
    [answer, card.id],
  );

  useEffect(() => {
    if (grade || !acceptsAnswer(card, round.input)) return;
    // Grade a carried draft after the next prompt mounts; cancel stale transitions.
    const timer = setTimeout(
      () => answer({ type: 'input', cardId: card.id, value: round.input }),
      0,
    );
    return () => clearTimeout(timer);
  }, [answer, card, grade, round.input]);

  const waitingForSave = !!onCommitReview && !!grade && saveStatus !== 'saved';
  const cardState = !grade ? 'default' : grade.correct ? 'correct' : 'wrong';

  // Results own their scroll area and pin the next actions in a footer.
  if (round.finished)
    return (
      <Screen>
        <StudyResults
          round={round}
          duration={timing.finished - timing.started}
          streak={streak}
          note={length ? t.finiteTemporary(length) : t.temporary}
          onChangeSelection={() => router.dismissTo('/kana')}
          onFinish={
            onCommitReview ? () => router.dismissTo('/kana') : undefined
          }
          onReview={() => {
            const mistakes = [
              ...new Map(
                score.mistakes.map((card) => [card.id, card]),
              ).values(),
            ];
            restart(createRound([nextPracticeCard(mistakes)], mistakes, false));
          }}
          onRepeat={() =>
            restart(
              createRound(
                [nextPracticeCard(cards, [], progress)],
                cards,
                false,
              ),
            )
          }
        />
      </Screen>
    );

  const finishAction = (
    <TextAction
      tone="muted"
      label={t.finishPractice}
      testID="finish-study"
      disabled={waitingForSave}
      onPress={() => {
        if (onCommitReview && pendingReview.current && saveStatus !== 'saved')
          return;
        finish();
      }}
    />
  );
  const summary = (
    <StudyProgress
      answered={round.grades.length}
      correct={score.correct}
      streak={score.streak}
    />
  );
  const saveError = saveStatus === 'error';
  const saveLine = onCommitReview ? (
    <View
      className={`min-h-5 items-center px-4 ${touch && grade ? 'pb-4' : ''}`}
      accessibilityLiveRegion="polite"
    >
      <Text
        testID="study-save-status"
        accessibilityRole={saveError ? 'alert' : undefined}
        className={`text-center font-ui text-[13px] ${saveError ? 'text-error' : 'text-muted-foreground'}`}
      >
        {saveStatus === 'saving'
          ? t.reviewSaving
          : saveError
            ? t.reviewSaveError
            : saveStatus === 'saved'
              ? (savedLevel ?? t.reviewSaved)
              : ''}
      </Text>
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      // Screen already reserves the home-indicator inset inside this view.
      keyboardVerticalOffset={-insets.bottom}
    >
      <Screen>
        <ScrollView
          contentContainerClassName="grow items-center"
          keyboardShouldPersistTaps="always"
        >
          <View className="w-full max-w-lg gap-3 px-4 pb-2 pt-3 sm:px-6">
            {length ? (
              <>
                <AnimatedProgressBar
                  value={round.grades.length / length}
                  combo={score.streak}
                  quitLabel={t.changeSelection}
                  quitTestID="close-study"
                  onQuit={() => router.dismissTo('/kana')}
                />
                <View className="flex-row items-center gap-2">
                  {summary}
                  {finishAction}
                </View>
              </>
            ) : (
              // Endless rounds have no end to measure: no progress bar.
              <View className="flex-row items-center gap-2">
                <CloseButton
                  label={t.changeSelection}
                  testID="close-study"
                  onPress={() => router.dismissTo('/kana')}
                />
                {summary}
                {finishAction}
              </View>
            )}
          </View>
          <View className="w-full max-w-lg flex-1 items-center gap-6 pb-2 pt-4">
            <KanaCardView
              testID="study-prompt"
              kana={card.kana}
              variant="hero"
              state={cardState}
              reading={card.reading}
              combo={score.streak}
            />
            {touch ? (
              <StudyCoins
                card={card}
                coins={coins}
                grade={grade}
                selected={selectedCoin}
                onSelect={(coin) =>
                  setPicked({ deck: round.deck, index: round.index, coin })
                }
              />
            ) : null}
          </View>
          <Text className="w-full max-w-lg px-6 pb-3 pt-1 text-center font-ui text-[13px] text-muted-foreground">
            {length
              ? onCommitReview
                ? t.finiteScheduledDetail(length)
                : t.finiteTemporary(length)
              : onCommitReview
                ? t.scheduledDetail
                : t.temporary}
          </Text>
        </ScrollView>
        {touch ? (
          <View testID="study-answer-area">
            {saveLine}
            <StudyTouchActions
              card={card}
              grade={grade}
              combo={score.streak}
              chosenKana={chosenKana}
              selected={selectedCoin}
              bottomInset={insets.bottom}
              continueDisabled={waitingForSave}
              saveError={saveError}
              onCheck={answerCoin}
              onSkip={() => answer({ type: 'reveal', cardId: card.id })}
              onContinue={advance}
              onRetry={() => void saveReview()}
            />
          </View>
        ) : (
          <View
            testID="study-answer-area"
            className="w-full max-w-lg gap-3 self-center px-4 pb-4 pt-2 sm:px-6"
          >
            <TextInput
              ref={input}
              autoFocus
              accessibilityLabel={t.romaji(
                card.kana,
                alphabetLabels[card.alphabet],
              )}
              testID="romaji-input"
              value={round.input}
              onChangeText={(value) =>
                answer({ type: 'input', cardId: card.id, value })
              }
              onSubmitEditing={(event) => {
                if (event.nativeEvent.text !== currentRound.current.input)
                  return;
                if (!grade) answer({ type: 'submit', cardId: card.id });
                else if (saveError) void saveReview();
                else advance();
              }}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              keyboardType="ascii-capable"
              returnKeyType="next"
              submitBehavior="submit"
              // React Native Web 0.21 still uses blurOnSubmit.
              blurOnSubmit={false}
              placeholder="Rōmaji"
              placeholderTextColor={
                typeof placeholderColor === 'string'
                  ? placeholderColor
                  : undefined
              }
              selectionColor={
                typeof selectionColor === 'string' ? selectionColor : undefined
              }
              keyboardAppearance={preferences.theme}
              className={`h-16 w-full rounded-full border-[2.5px] bg-card px-5 text-center font-ui-bold text-[26px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring ${grade ? (grade.correct ? 'border-success' : 'border-error') : 'border-line'}`}
            />
            <TypingFeedback
              correct={grade?.correct}
              message={
                !grade
                  ? feedback
                  : `${gradeLabel} · ${card.reading}${!grade.correct && grade.answer !== null ? `\n${t.yourAnswer(grade.answer)}` : ''}`
              }
            />
            {saveLine}
            {/* One full-width current action: Check, then Next (or Retry). */}
            {!grade ? (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <GameButton
                    variant="secondary"
                    block
                    testID="study-action"
                    onPress={() => answer({ type: 'reveal', cardId: card.id })}
                  >
                    {t.reveal}
                  </GameButton>
                </View>
                <View className="flex-1">
                  <GameButton
                    block
                    testID="check-answer"
                    onPress={() => answer({ type: 'submit', cardId: card.id })}
                  >
                    {t.check}
                  </GameButton>
                </View>
              </View>
            ) : saveError ? (
              <GameButton
                key="retry"
                block
                testID="study-retry"
                onPress={() => void saveReview()}
              >
                {t.retry}
              </GameButton>
            ) : (
              <GameButton
                key="next"
                block
                testID="study-action"
                disabled={waitingForSave}
                onPress={advance}
              >
                {t.next}
              </GameButton>
            )}
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
