import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import { cards } from '@/data/kana';
import {
  acceptsAnswer,
  createRound,
  parseStudySetup,
  roundScore,
  selectAlphabet,
  selectedCards,
  shuffle,
  studyReducer,
  validFamilyIds,
  toggleKanaGroup,
} from '@/lib/study';

test('setup validation, mixed selection and scoped bulk actions', () => {
  assert.deepEqual(validFamilyIds(['hiragana:a', 'nope', 'hiragana:a', 1]), [
    'hiragana:a',
  ]);
  for (const invalid of [
    undefined,
    null,
    [],
    'oops',
    '{}',
    '[]',
    '["unknown"]',
  ])
    assert.deepEqual(parseStudySetup(invalid), []);
  const selected = ['hiragana:a', 'katakana:a'];
  assert.equal(
    parseStudySetup(JSON.stringify([...selected, 'hiragana:a'])).length,
    10,
  );
  const allKatakana = selectAlphabet(selected, 'katakana', true);
  assert.equal(selectedCards(allKatakana).length, 112);
  assert.deepEqual(selectAlphabet(allKatakana, 'katakana', false), [
    'hiragana:a',
  ]);
});

test('shuffle keeps each selected identity once without mutating its source', () => {
  const source = selectedCards([
    'hiragana:a',
    'katakana:a',
    'hiragana:za',
    'hiragana:da',
  ]);
  const before = source.map((card) => card.id);
  const shuffled = shuffle(source);
  assert.notEqual(shuffled, source);
  assert.deepEqual(shuffled.map((card) => card.id).sort(), [...before].sort());
  assert.deepEqual(
    source.map((card) => card.id),
    before,
  );
});

test('partial/wrong drafts and blanks do not grade; whole normalized readings grade on input', () => {
  const shi = cards.find((card) => card.kana === 'し')!;
  for (const rejected of ['s', 'sh i', 'し', 'chi', ''])
    assert.equal(acceptsAnswer(shi, rejected), false);
  let round = createRound([shi]);
  for (const value of ['s', 'sh', 'x', 'sh i', '']) {
    round = studyReducer(round, { type: 'input', cardId: shi.id, value });
    assert.equal(round.grades.length, 0);
    assert.equal(round.input, value);
  }
  round = studyReducer(round, { type: 'input', cardId: shi.id, value: '  ' });
  round = studyReducer(round, { type: 'submit', cardId: shi.id });
  assert.equal(round.grades.length, 0);
  assert.equal(round.needsAnswer, true);
  round = studyReducer(round, { type: 'input', cardId: shi.id, value: ' SI ' });
  assert.equal(round.grades.length, 1);
  round = studyReducer(round, { type: 'submit', cardId: shi.id });
  assert.equal(roundScore(round).correct, 1);
  assert.equal(round.finished, false);
  assert.equal(
    studyReducer(round, { type: 'next', cardId: shi.id }).finished,
    true,
  );
});

test('duplicate submit/reveal/next events cannot change a grade or skip a card', () => {
  let round = createRound(selectedCards(['hiragana:a']));
  const cardId = round.deck[0].id;
  round = studyReducer(round, { type: 'reveal', cardId });
  for (const type of ['reveal', 'submit'] as const)
    assert.equal(studyReducer(round, { type, cardId }), round);
  round = studyReducer(round, { type: 'next', cardId });
  assert.equal(round.index, 1);
  assert.equal(round.input, '');
  for (const type of ['next', 'reveal', 'submit'] as const)
    assert.equal(studyReducer(round, { type, cardId }), round);
  assert.equal(
    studyReducer(round, { type: 'next', cardId: round.deck[1].id }),
    round,
  );
  assert.equal(round.grades.length, 1);
});

test('grading retains the submitted draft; only new text after a correct card carries forward', () => {
  for (const answer of ['a', 'wrong']) {
    let round = createRound(cards.slice(0, 2), undefined, false);
    const cardId = round.deck[0].id;
    round = studyReducer(round, { type: 'input', cardId, value: answer });
    round = studyReducer(round, { type: 'submit', cardId });
    assert.equal(round.input, answer);
    const grade = round.grades[0];
    round = studyReducer(round, { type: 'input', cardId, value: 'i' });
    round = studyReducer(round, { type: 'submit', cardId });
    assert.equal(round.grades.length, 1);
    assert.equal(round.grades[0], grade);
    round = studyReducer(round, { type: 'reveal', cardId });
    round = studyReducer(round, { type: 'next', cardId });
    assert.equal(round.input, answer === 'a' ? 'i' : '');
    assert.equal(round.grades.length, 1);
  }
});

test('scores include reveals; review resets scores and repeat retains the original selection', () => {
  let round = createRound(selectedCards(['hiragana:a']));
  const original = round.original;
  for (let i = 0; i < 5; i++) {
    const card = round.deck[i];
    round = studyReducer(round, {
      type: 'input',
      cardId: card.id,
      value: i < 3 ? card.reading : 'wrong',
    });
    round = studyReducer(round, {
      type: i === 4 ? 'reveal' : 'submit',
      cardId: card.id,
    });
    if (i === 3)
      round = studyReducer(round, { type: 'reveal', cardId: card.id });
    round = studyReducer(round, { type: 'next', cardId: card.id });
  }
  const score = roundScore(round);
  assert.equal(round.finished, true);
  assert.equal(score.correct, 3);
  assert.equal(score.accuracy, 60);
  assert.equal(score.mistakes.length, 2);
  assert.equal(round.grades[3].answer, 'wrong');
  assert.equal(round.grades[4].answer, null);
  const review = createRound(score.mistakes, round.original);
  assert.deepEqual(new Set(review.deck), new Set(score.mistakes));
  assert.equal(review.grades.length, 0);
  assert.equal(review.index, 0);
  assert.equal(review.original, original);
  const repeated = createRound(review.original);
  assert.equal(repeated.deck.length, 5);
  assert.equal(roundScore(round).accuracy, 60);
  const perfect = {
    ...review,
    grades: review.deck.map((card, attempt) => ({
      attempt,
      card,
      correct: true,
      answer: card.reading,
    })),
  };
  assert.equal(roundScore(perfect).accuracy, 100);
  assert.deepEqual(roundScore(perfect).mistakes, []);
});

test('every canonical reading and alias auto-grades as a whole normalized input', () => {
  for (const card of cards) {
    for (const reading of [card.reading, ...card.aliases]) {
      const round = studyReducer(createRound([card]), {
        type: 'input',
        cardId: card.id,
        value: ` ${reading.toUpperCase()} `,
      });
      assert.equal(round.grades.length, 1);
      assert.equal(round.grades[0].correct, true);
    }
  }
});

test('confirmed errors can continue at once and never change rating', () => {
  const card = cards[0];
  let round = studyReducer(createRound([card]), {
    type: 'input',
    cardId: card.id,
    value: 'wrong',
  });
  round = studyReducer(round, { type: 'submit', cardId: card.id });
  const grade = round.grades[0];
  assert.equal(round.input, 'wrong');
  round = studyReducer(round, {
    type: 'input',
    cardId: card.id,
    value: card.reading,
  });
  for (const type of ['reveal', 'submit'] as const)
    assert.equal(studyReducer(round, { type, cardId: card.id }), round);
  assert.equal(round.grades[0], grade);
  assert.equal(grade.correct, false);
  assert.equal(
    studyReducer(round, { type: 'next', cardId: card.id }).finished,
    true,
  );
});

test('session streaks count only immutable grades, break on errors/reveals, and reset on restart', () => {
  let round = createRound(cards.slice(0, 5), undefined, false);
  for (const [index, card] of round.deck.entries()) {
    if (index === 4)
      round = studyReducer(round, { type: 'reveal', cardId: card.id });
    else {
      round = studyReducer(round, {
        type: 'input',
        cardId: card.id,
        value: index === 2 ? 'wrong' : card.reading,
      });
      round = studyReducer(round, { type: 'submit', cardId: card.id });
      if (index === 2) {
        assert.equal(roundScore(round).streak, 0);
        round = studyReducer(round, {
          type: 'input',
          cardId: card.id,
          value: card.reading,
        });
        assert.equal(roundScore(round).streak, 0);
        round = studyReducer(round, { type: 'reveal', cardId: card.id });
      }
    }
    if (index === 1) assert.equal(roundScore(round).streak, 2);
    round = studyReducer(round, { type: 'next', cardId: card.id });
  }
  assert.equal(roundScore(round).bestStreak, 2);
  assert.equal(roundScore(round).streak, 0);
  assert.equal(round.grades[2].answer, 'wrong');
  const restarted = studyReducer(round, {
    type: 'restart',
    round: createRound(roundScore(round).mistakes, round.original),
  });
  assert.equal(roundScore(restarted).bestStreak, 0);
  assert.equal(roundScore(restarted).streak, 0);
});

test('individual setup does not expand families and group toggles preserve other cards', () => {
  assert.deepEqual(
    parseStudySetup(
      '["hiragana:い", "hiragana:い", "hiragana:a", "gone"]',
      true,
    ).map((card) => card.id),
    ['hiragana:い'],
  );
  assert.deepEqual(parseStudySetup('[]', true), []);
  assert.deepEqual(
    toggleKanaGroup(
      ['katakana:キュ', 'hiragana:い'],
      ['hiragana:あ', 'hiragana:い'],
    ),
    ['katakana:キュ', 'hiragana:い', 'hiragana:あ'],
  );
  assert.deepEqual(
    toggleKanaGroup(
      ['katakana:キュ', 'hiragana:あ', 'hiragana:い'],
      ['hiragana:あ', 'hiragana:い'],
    ),
    ['katakana:キュ'],
  );
});
