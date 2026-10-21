import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import { alphabets, cards, families } from '@/data/kana';
import { acceptsAnswer } from '@/lib/study';

test('catalog has 46 basic, 25 voiced and 36 yōon cards in each alphabet', () => {
  assert.equal(cards.length, 214);
  assert.equal(new Set(cards.map((card) => card.id)).size, 214);
  assert.equal(new Set(families.map((family) => family.id)).size, 56);
  for (const alphabet of alphabets) {
    const script = families.filter((family) => family.alphabet === alphabet);
    assert.deepEqual(
      ['basic', 'voiced', 'yoon'].map(
        (section) =>
          script
            .filter((family) => family.section === section)
            .flatMap((family) => family.cards).length,
      ),
      [46, 25, 36],
    );
    assert.equal(
      new Set(script.flatMap((family) => family.cards.map((card) => card.kana)))
        .size,
      107,
    );
    for (const family of script) {
      for (const card of family.cards) {
        assert.equal(card.familyId, family.id);
        assert.match(card.reading, /^[a-z]+$/);
        assert.ok(acceptsAnswer(card, card.reading));
      }
    }
  }
});

test('all alias exceptions are explicit and stay attached to their glyphs', () => {
  const exceptions = [
    ['し', 'シ', 'shi', 'si'],
    ['ち', 'チ', 'chi', 'ti'],
    ['つ', 'ツ', 'tsu', 'tu'],
    ['ふ', 'フ', 'fu', 'hu'],
    ['じ', 'ジ', 'ji', 'zi'],
    ['ぢ', 'ヂ', 'ji', 'di'],
    ['づ', 'ヅ', 'zu', 'du'],
    ['を', 'ヲ', 'wo', 'o'],
    ['ん', 'ン', 'n', 'nn'],
    ['しゃ', 'シャ', 'sha', 'sya'],
    ['しゅ', 'シュ', 'shu', 'syu'],
    ['しょ', 'ショ', 'sho', 'syo'],
    ['ちゃ', 'チャ', 'cha', 'tya', 'cya'],
    ['ちゅ', 'チュ', 'chu', 'tyu', 'cyu'],
    ['ちょ', 'チョ', 'cho', 'tyo', 'cyo'],
    ['じゃ', 'ジャ', 'ja', 'jya', 'zya'],
    ['じゅ', 'ジュ', 'ju', 'jyu', 'zyu'],
    ['じょ', 'ジョ', 'jo', 'jyo', 'zyo'],
    ['ぢゃ', 'ヂャ', 'ja', 'dya'],
    ['ぢゅ', 'ヂュ', 'ju', 'dyu'],
    ['ぢょ', 'ヂョ', 'jo', 'dyo'],
  ];
  for (const card of cards) {
    const exception = exceptions.find(
      ([h, k]) => card.kana === h || card.kana === k,
    );
    assert.deepEqual(card.aliases, exception?.slice(3) ?? []);
    if (exception) assert.equal(card.reading, exception[2]);
    for (const answer of [card.reading, ...card.aliases])
      assert.ok(acceptsAnswer(card, ` ${answer.toUpperCase()} `));
  }
  for (const [kana, rejected] of [
    ['じ', 'di'],
    ['ぢ', 'zi'],
    ['ず', 'du'],
    ['じゃ', 'dya'],
    ['ぢゃ', 'zya'],
  ]) {
    assert.equal(
      acceptsAnswer(
        cards.find((card) => card.kana === kana)!,
        rejected,
      ),
      false,
    );
  }
});
