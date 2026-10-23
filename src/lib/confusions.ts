import { cards, type KanaCard } from '@/data/kana';
import type { DocumentStore } from '@/lib/document-store';
import { acceptsAnswer } from '@/lib/study';

export type ConfusionDocument = {
  version: 1;
  generation: number;
  pairs: Record<string, { count: number; last: string }>;
};

const byId = new Map(cards.map((card) => [card.id, card]));
const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** The other kana of the same alphabet that a wrong answer actually spells. */
export function confusedCard(card: KanaCard, answer: string | null) {
  if (answer === null || acceptsAnswer(card, answer)) return null;
  return (
    cards.find(
      (other) =>
        other.alphabet === card.alphabet &&
        other.id !== card.id &&
        acceptsAnswer(other, answer),
    ) ?? null
  );
}

export function parseConfusions(
  raw: string | null,
  generation: number,
): ConfusionDocument {
  const empty: ConfusionDocument = { version: 1, generation, pairs: {} };
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw) as Partial<ConfusionDocument>;
    if (
      value.version !== 1 ||
      value.generation !== generation ||
      !value.pairs ||
      typeof value.pairs !== 'object'
    )
      return empty;
    const pairs: ConfusionDocument['pairs'] = {};
    for (const [key, entry] of Object.entries(value.pairs)) {
      const [a, b] = key.split('|');
      if (
        byId.has(a) &&
        byId.has(b) &&
        Number.isSafeInteger(entry?.count) &&
        entry.count > 0 &&
        typeof entry.last === 'string'
      )
        pairs[key] = { count: entry.count, last: entry.last };
    }
    return { version: 1, generation, pairs };
  } catch {
    return empty;
  }
}

export function addConfusion(
  doc: ConfusionDocument,
  a: string,
  b: string,
  at: Date,
): ConfusionDocument {
  const key = pairKey(a, b);
  const count = (doc.pairs[key]?.count ?? 0) + 1;
  return {
    ...doc,
    pairs: { ...doc.pairs, [key]: { count, last: at.toISOString() } },
  };
}

/** The most confused pair with at least two confusions; the latest wins ties. */
export function topConfusion(doc: ConfusionDocument) {
  let best: {
    cards: [KanaCard, KanaCard];
    count: number;
    last: string;
  } | null = null;
  for (const [key, entry] of Object.entries(doc.pairs)) {
    if (entry.count < 2) continue;
    if (
      best &&
      (entry.count < best.count ||
        (entry.count === best.count && entry.last <= best.last))
    )
      continue;
    const [a, b] = key.split('|');
    best = {
      cards: [byId.get(a)!, byId.get(b)!],
      count: entry.count,
      last: entry.last,
    };
  }
  return best;
}

/** Ids of kana confused with `cardId`, most confused first. */
export function confusedWith(doc: ConfusionDocument, cardId: string) {
  return Object.entries(doc.pairs)
    .filter(([key]) => key.split('|').includes(cardId))
    .sort(([, x], [, y]) => y.count - x.count)
    .map(([key]) => key.split('|').find((id) => id !== cardId)!);
}

/** Per-account confusions in their own document, apart from reviews and sync. */
export function createConfusionStore(db: DocumentStore) {
  const key = (account: string) => `confusions:${account}`;
  return {
    async read(account: string, generation: number) {
      return parseConfusions(await db.read(key(account)), generation);
    },
    record(
      account: string,
      generation: number,
      a: string,
      b: string,
      at = new Date(),
    ) {
      return db.update(key(account), (raw) => {
        const next = addConfusion(parseConfusions(raw, generation), a, b, at);
        return { raw: JSON.stringify(next), result: next };
      });
    },
  };
}
