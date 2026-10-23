import { cards, families, type KanaCard } from '@/data/kana';

const sectionOf = new Map(
  families.map((family) => [family.id, family.section]),
);

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Three rōmaji coins for a prompt: its canonical reading and two other
 * readings of the same alphabet. Distractors prefer confused kana, then the
 * other kana of the round, then the same section, and never repeat a reading.
 */
export function coinChoices(
  card: KanaCard,
  confusedWith: readonly string[] = [],
  roundIds: readonly string[] = [],
  random = Math.random,
): string[] {
  const used = new Set([card.reading]);
  const picked: string[] = [];
  const take = (pool: readonly KanaCard[]) => {
    for (const other of shuffled(pool, random)) {
      if (picked.length === 2) return;
      if (used.has(other.reading)) continue;
      used.add(other.reading);
      picked.push(other.reading);
    }
  };
  const sameAlphabet = cards.filter(
    (other) => other.alphabet === card.alphabet && other.id !== card.id,
  );
  const confused = new Set(confusedWith);
  take(sameAlphabet.filter((other) => confused.has(other.id)));
  const inRound = new Set(roundIds);
  take(sameAlphabet.filter((other) => inRound.has(other.id)));
  take(
    sameAlphabet.filter(
      (other) => sectionOf.get(other.familyId) === sectionOf.get(card.familyId),
    ),
  );
  take(sameAlphabet);
  return shuffled([card.reading, ...picked], random);
}
