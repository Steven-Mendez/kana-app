import { families, type Alphabet, type KanaCard } from '@/data/kana';
import { isMastered, mastery, type KanaProgress } from '@/lib/kana-mastery';

export type BoardTile = {
  card: KanaCard;
  state: 'unseen' | 'learning' | 'mastered';
  /** 0–1 mastery level. */
  strength: number;
};

/** Board state of one kana from its saved mastery. Reads only. */
export function boardTile(card: KanaCard, saved?: KanaProgress): BoardTile {
  if (!saved) return { card, state: 'unseen', strength: 0 };
  return {
    card,
    state: isMastered(saved) ? 'mastered' : 'learning',
    strength: saved.level / mastery.max,
  };
}

/** Vowel columns of a kana table: A/U/O for yōon, A/I/U/E/O otherwise. */
export const vowelColumns = (yoon: boolean) =>
  yoon ? ['a', 'u', 'o'] : ['a', 'i', 'u', 'e', 'o'];

export type BoardSlot = { key: string; tile: BoardTile | null };

/** Basic gojūon rows of an alphabet, five slots per row with gaps kept. */
export function boardRows(
  alphabet: Alphabet,
  progress: ReadonlyMap<string, KanaProgress>,
): { familyId: string; slots: BoardSlot[] }[] {
  return families
    .filter(
      (family) => family.alphabet === alphabet && family.section === 'basic',
    )
    .map((family) => {
      const tiles = family.cards.map((card) =>
        boardTile(card, progress.get(card.id)),
      );
      // や and わ rows have gaps under い/え (and う/え for わ) in the gojūon grid.
      const columns =
        tiles.length === 3
          ? [tiles[0], null, tiles[1], null, tiles[2]]
          : tiles.length === 2
            ? [tiles[0], null, null, null, tiles[1]]
            : tiles.length === 1
              ? [tiles[0], null, null, null, null]
              : tiles;
      const vowels = ['a', 'i', 'u', 'e', 'o'];
      return {
        familyId: family.id,
        slots: columns.map((tile, column) => ({
          key: tile?.card.id ?? `${family.id}:${vowels[column]}`,
          tile,
        })),
      };
    });
}
