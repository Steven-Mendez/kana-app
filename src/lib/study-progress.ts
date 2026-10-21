import { State, type Card } from 'ts-fsrs';

import { alphabets, cards, type KanaCard } from '@/data/kana';

export function summarizeProgress(saved: ReadonlyMap<string, Card>, now: Date) {
  const reviewed = cards.filter((kana) => (saved.get(kana.id)?.reps ?? 0) > 0);
  const due = reviewed
    .filter((kana) => saved.get(kana.id)!.due.getTime() <= now.getTime())
    .sort(
      (a, b) => saved.get(a.id)!.due.getTime() - saved.get(b.id)!.due.getTime(),
    );
  const next = reviewed
    .map((kana) => saved.get(kana.id)!.due)
    .filter((date) => date.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime())[0];
  return {
    reviewed: reviewed.length,
    unseen: cards.length - reviewed.length,
    due,
    next,
    today: reviewed.filter(
      (kana) =>
        saved.get(kana.id)?.last_review?.toDateString() === now.toDateString(),
    ).length,
    reviews: reviewed.reduce((sum, kana) => sum + saved.get(kana.id)!.reps, 0),
    learning: reviewed.filter(
      (kana) => saved.get(kana.id)!.state === State.Learning,
    ).length,
    relearning: reviewed.filter(
      (kana) => saved.get(kana.id)!.state === State.Relearning,
    ).length,
    scheduled: reviewed.filter(
      (kana) => saved.get(kana.id)!.state === State.Review,
    ).length,
    alphabets: alphabets.map((alphabet) => ({
      alphabet,
      total: cards.filter((kana) => kana.alphabet === alphabet).length,
      reviewed: reviewed.filter((kana) => kana.alphabet === alphabet).length,
    })),
  };
}

export function dueStudyParams(due: readonly KanaCard[]) {
  return {
    families: JSON.stringify([...new Set(due.map((card) => card.familyId))]),
    due: JSON.stringify(due.map((card) => card.id)),
    mode: 'scheduled',
  };
}

export function filterDueSnapshot(cards: KanaCard[], raw?: string | string[]) {
  if (raw === undefined) return cards;
  try {
    const ids: unknown = JSON.parse(typeof raw === 'string' ? raw : '');
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string'))
      return [];
    const wanted = new Set(ids);
    return cards.filter((card) => wanted.has(card.id));
  } catch {
    return [];
  }
}
