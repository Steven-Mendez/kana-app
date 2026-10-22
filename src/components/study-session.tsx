import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Action } from '@/components/action';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { StudyProgress } from '@/components/study-progress';
import { TypingPrompt } from '@/components/typing-prompt';
import { TypingFeedback } from '@/components/typing-feedback';
import { StudyResults } from '@/components/study-results';
import { alphabetLabels, type KanaCard } from '@/data/kana';
import {
  acceptsAnswer,
  createRound,
  roundScore,
  studyReducer,
  type StudyAction,
} from '@/lib/study';
import { usePreferences } from '@/lib/preferences-provider';
import type { ReviewRequest, StoredProgress } from '@/lib/review-storage';
import { ratingForAnswer } from '@/lib/spaced-repetition';
import { nextPracticeCard } from '@/lib/practice-sampling';
import type { Card } from 'ts-fsrs';

export function StudySession({
  cards,
  onCommitReview,
  progress,
}: {
  cards: KanaCard[];
  progress?: ReadonlyMap<string, Card>;
  onCommitReview?: (
    request: ReviewRequest,
  ) => Promise<StoredProgress | { practiceOnly: true } | void>;
}) {
  const { t, preferences } = usePreferences();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
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
  const [practiceOnly, setPracticeOnly] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [answerHeight, setAnswerHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [alphabetHeight, setAlphabetHeight] = useState(0);
  // Scroll content is unbounded; reserve the measured controls before sizing kana.
  const promptHeight = Math.max(
    80 * fontScale,
    viewportHeight - headerHeight - answerHeight - footerHeight - 16,
  );
  const kanaSize = Math.min(
    128 * Math.min(fontScale, 1.5),
    Math.max(32, (promptHeight - alphabetHeight - 4) / 1.25),
  );
  const card = round.deck[round.index];
  const grade = round.grades[round.index];
  const score = roundScore(round);
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

  const advance = useCallback(() => {
    if (
      !grade ||
      currentRound.current.grades[currentRound.current.index] !== grade ||
      (onCommitReview && saveStatus !== 'saved')
    )
      return;
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
  ]);

  const hasNextInput = round.nextInput;
  useEffect(() => {
    if (
      round.finished ||
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
  ]);

  useEffect(
    () => () => {
      pendingReview.current = null;
    },
    [],
  );

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
        setPracticeOnly(!!result && 'practiceOnly' in result);
        setSaveStatus('saved');
      }
    } catch {
      if (pendingReview.current === request) setSaveStatus('error');
    } finally {
      saving.current = false;
    }
  }, [onCommitReview, round.deck, round.index]);

  const answer = useCallback(
    (action: StudyAction) => {
      const previousGrade =
        currentRound.current.grades[currentRound.current.index];
      const next = dispatch(action);
      if (!next) return;
      input.current?.focus();
      const result = next.grades[round.index];
      if (!result || previousGrade) return;
      feedbackUntil.current = Date.now() + 250;
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
    [dispatch, round.index, card.id, onCommitReview, saveReview],
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

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      // Screen already reserves the home-indicator inset inside this view.
      keyboardVerticalOffset={-insets.bottom}
    >
      <Screen>
        <ScrollView
          key={round.finished ? 'results' : 'round'}
          contentContainerClassName="grow items-center"
          keyboardShouldPersistTaps="always"
          onLayout={(event) =>
            setViewportHeight(event.nativeEvent.layout.height)
          }
        >
          <View
            onLayout={(event) =>
              setHeaderHeight(event.nativeEvent.layout.height)
            }
            className="w-full max-w-lg flex-row flex-wrap items-center gap-2 px-4 py-2 sm:px-6"
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.changeSelection}
              testID="close-study"
              className="h-11 w-11 items-center justify-center rounded-full bg-muted active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
              onPress={() => router.dismissTo('/practice')}
            >
              <Icon
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={18}
              />
            </Pressable>
            {!round.finished ? (
              <StudyProgress
                answered={round.grades.length}
                correct={score.correct}
                streak={score.streak}
              />
            ) : null}
            {!round.finished ? (
              <Action
                testID="finish-study"
                label={t.finishPractice}
                disabled={!!onCommitReview && !!grade && saveStatus !== 'saved'}
                onPress={() => {
                  if (
                    onCommitReview &&
                    pendingReview.current &&
                    saveStatus !== 'saved'
                  )
                    return;
                  dispatch({ type: 'finish' });
                }}
              />
            ) : null}
          </View>
          {round.finished ? (
            <StudyResults
              round={round}
              onFinish={
                onCommitReview ? () => router.dismissTo('/practice') : undefined
              }
              onReview={() =>
                dispatch({
                  type: 'restart',
                  round: (() => {
                    const mistakes = [
                      ...new Map(
                        score.mistakes.map((card) => [card.id, card]),
                      ).values(),
                    ];
                    return createRound(
                      [nextPracticeCard(mistakes)],
                      mistakes,
                      false,
                    );
                  })(),
                })
              }
              onRepeat={() =>
                dispatch({
                  type: 'restart',
                  round: createRound(
                    [nextPracticeCard(cards, [], progress)],
                    cards,
                    false,
                  ),
                })
              }
            />
          ) : (
            <View className="w-full max-w-lg gap-2 px-4 pb-2 sm:px-6">
              <TypingPrompt
                card={card}
                height={promptHeight}
                fontSize={kanaSize}
                correct={grade?.correct}
                onLabelHeight={setAlphabetHeight}
              />
              <View
                onLayout={(event) =>
                  setAnswerHeight(event.nativeEvent.layout.height)
                }
                className="w-full items-center gap-2"
              >
                <View className="w-full flex-row items-center justify-center gap-2">
                  <View className="w-11" />
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
                      else if (saveStatus === 'error') void saveReview();
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
                      typeof selectionColor === 'string'
                        ? selectionColor
                        : undefined
                    }
                    keyboardAppearance={preferences.theme}
                    className={`min-h-14 flex-1 max-w-48 border-b-2 px-3 py-3 text-center text-2xl placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring ${grade ? (grade.correct ? 'border-success text-success' : 'border-error text-error') : 'border-input text-foreground focus:border-ring'}`}
                  />
                  {!grade ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t.check}
                      testID="check-answer"
                      onPress={() =>
                        answer({ type: 'submit', cardId: card.id })
                      }
                      className="h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <Icon
                        name={{
                          ios: 'arrow.up',
                          android: 'arrow_upward',
                          web: 'arrow_upward',
                        }}
                        color="primary-foreground"
                      />
                    </Pressable>
                  ) : (
                    <View className="w-11" />
                  )}
                </View>
                <TypingFeedback
                  correct={grade?.correct}
                  message={
                    !grade
                      ? feedback
                      : `${gradeLabel} · ${card.reading}${!grade.correct && grade.answer !== null ? `\n${t.yourAnswer(grade.answer)}` : ''}`
                  }
                />
                {onCommitReview ? (
                  <View
                    className="min-h-5 gap-2"
                    accessibilityLiveRegion="polite"
                  >
                    <Text
                      testID="study-save-status"
                      accessibilityRole={
                        saveStatus === 'error' ? 'alert' : undefined
                      }
                      className={`text-center text-sm ${saveStatus === 'error' ? 'text-error' : 'text-muted-foreground'}`}
                    >
                      {saveStatus === 'saving'
                        ? t.reviewSaving
                        : saveStatus === 'error'
                          ? t.reviewSaveError
                          : saveStatus === 'saved'
                            ? practiceOnly
                              ? t.practiceCounted
                              : t.reviewSaved
                            : ''}
                    </Text>
                    {saveStatus === 'error' ? (
                      <Action
                        testID="study-retry"
                        primary
                        label={t.retry}
                        onPress={() => void saveReview()}
                      />
                    ) : null}
                  </View>
                ) : null}
                {grade ? (
                  <Action
                    key="next"
                    testID="study-action"
                    primary={saveStatus !== 'error'}
                    disabled={!!onCommitReview && saveStatus !== 'saved'}
                    label={t.next}
                    onPress={advance}
                  />
                ) : (
                  <Action
                    testID="study-action"
                    label={t.reveal}
                    onPress={() => answer({ type: 'reveal', cardId: card.id })}
                  />
                )}
              </View>
            </View>
          )}
          <Text
            onLayout={(event) =>
              setFooterHeight(event.nativeEvent.layout.height)
            }
            className="w-full max-w-lg px-6 pt-1 pb-3 text-center text-xs text-muted-foreground"
          >
            {onCommitReview ? t.scheduledDetail : t.temporary}
          </Text>
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}
