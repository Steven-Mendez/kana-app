import { cards, families, type Alphabet, type KanaCard } from '@/data/kana';

const familyIds = new Set(families.map((family) => family.id));

export function validFamilyIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === 'string' && familyIds.has(id),
      ),
    ),
  ];
}

const kanaIds = new Set(cards.map((card) => card.id));

export function validKanaIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === 'string' && kanaIds.has(id),
      ),
    ),
  ];
}

export function toggleKanaGroup(
  ids: readonly string[],
  group: readonly string[],
): string[] {
  const selected = new Set(ids);
  const all = group.every((id) => selected.has(id));
  for (const id of group) {
    if (all) selected.delete(id);
    else selected.add(id);
  }
  return [...selected];
}

export function selectedCards(ids: readonly string[]): KanaCard[] {
  const selected = new Set(ids);
  return cards.filter(
    (card) => selected.has(card.id) || selected.has(card.familyId),
  );
}

export function parseStudySetup(
  value: unknown,
  individual = false,
): KanaCard[] {
  if (typeof value !== 'string') return [];
  try {
    return selectedCards(
      (individual ? validKanaIds : validFamilyIds)(JSON.parse(value)),
    );
  } catch {
    return [];
  }
}

export function selectAlphabet(
  ids: readonly string[],
  alphabet: Alphabet,
  selected: boolean,
): string[] {
  const other = ids.filter((id) => !id.startsWith(`${alphabet}:`));
  return selected
    ? [
        ...other,
        ...cards
          .filter((card) => card.alphabet === alphabet)
          .map((card) => card.id),
      ]
    : other;
}

export function acceptsAnswer(card: KanaCard, answer: string): boolean {
  const normalized = answer.trim().toLowerCase();
  return normalized === card.reading || card.aliases.includes(normalized);
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type Grade = { card: KanaCard; answer: string | null; correct: boolean };
export type Round = {
  original: readonly KanaCard[];
  deck: KanaCard[];
  index: number;
  grades: Grade[];
  input: string;
  nextInput: boolean;
  readingVisible: boolean;
  needsAnswer: boolean;
  finished: boolean;
};

export function createRound(
  deck: readonly KanaCard[],
  original = deck,
  randomize = true,
): Round {
  return {
    original,
    deck: randomize ? shuffle(deck) : [...deck],
    index: 0,
    grades: [],
    input: '',
    nextInput: false,
    readingVisible: false,
    needsAnswer: false,
    finished: false,
  };
}

export function roundScore(round: Round) {
  const correct = round.grades.filter((grade) => grade.correct).length;
  const mistakes = round.grades
    .filter((grade) => !grade.correct)
    .map((grade) => grade.card);
  let streak = 0;
  let bestStreak = 0;
  for (const grade of round.grades) {
    streak = grade.correct ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  return {
    correct,
    mistakes,
    streak,
    bestStreak,
    accuracy: round.deck.length
      ? Math.round((correct / round.deck.length) * 100)
      : 0,
  };
}

export type StudyAction =
  | { type: 'input'; cardId: string; value: string }
  | { type: 'submit' | 'reveal' | 'next'; cardId: string }
  | { type: 'restart'; round: Round };

export function studyReducer(round: Round, action: StudyAction): Round {
  if (action.type === 'restart') return round.finished ? action.round : round;
  const card = round.deck[round.index];
  if (round.finished || !card || card.id !== action.cardId) return round;
  const graded = round.grades.length > round.index;

  if (action.type === 'next') {
    if (
      !graded ||
      (!round.grades[round.index].correct && !round.readingVisible)
    )
      return round;
    if (round.index === round.deck.length - 1)
      return { ...round, finished: true };
    return {
      ...round,
      index: round.index + 1,
      input:
        round.grades[round.index].correct && round.nextInput ? round.input : '',
      nextInput: false,
      readingVisible: false,
      needsAnswer: false,
    };
  }
  if (action.type === 'input') {
    if (graded) {
      const grade = round.grades[round.index];
      if (!grade.correct || round.nextInput)
        return { ...round, input: action.value, needsAnswer: false };
      if (acceptsAnswer(card, action.value))
        return { ...round, input: action.value };
      const input = action.value.startsWith(round.input)
        ? action.value.slice(round.input.length)
        : action.value;
      return { ...round, input, nextInput: input.length > 0 };
    }
    round = { ...round, input: action.value, needsAnswer: false };
    if (!acceptsAnswer(card, action.value)) return round;
  }
  if (graded)
    return action.type === 'reveal' && !round.readingVisible
      ? { ...round, readingVisible: true }
      : round;
  if (action.type === 'submit' && !round.input.trim())
    return { ...round, needsAnswer: true };

  const answer = action.type === 'reveal' ? null : round.input.trim();
  return {
    ...round,
    input: action.type === 'reveal' ? '' : round.input,
    readingVisible: action.type === 'reveal',
    needsAnswer: false,
    grades: [
      ...round.grades,
      { card, answer, correct: answer !== null && acceptsAnswer(card, answer) },
    ],
  };
}
