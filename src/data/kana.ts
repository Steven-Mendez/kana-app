export const alphabets = ['hiragana', 'katakana'] as const;
export type Alphabet = (typeof alphabets)[number];

export const alphabetLabels: Record<Alphabet, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
};

export const sections = [
  { id: 'basic', label: 'Básicos' },
  { id: 'voiced', label: 'Tenten / Maru' },
  { id: 'yoon', label: 'Combinados' },
] as const;

export type KanaCard = {
  id: string;
  alphabet: Alphabet;
  familyId: string;
  kana: string;
  reading: string;
  aliases: readonly string[];
};

export type KanaFamily = {
  id: string;
  alphabet: Alphabet;
  section: (typeof sections)[number]['id'];
  label: string;
  cards: KanaCard[];
};

// Each tuple keeps both glyphs, the canonical reading, and its exceptions together.
type Entry = readonly [string, string, string, ...string[]];
type FamilyDefinition = readonly [
  string,
  KanaFamily['section'],
  readonly Entry[],
];

const definitions: readonly FamilyDefinition[] = [
  [
    'a',
    'basic',
    [
      ['あ', 'ア', 'a'],
      ['い', 'イ', 'i'],
      ['う', 'ウ', 'u'],
      ['え', 'エ', 'e'],
      ['お', 'オ', 'o'],
    ],
  ],
  [
    'ka',
    'basic',
    [
      ['か', 'カ', 'ka'],
      ['き', 'キ', 'ki'],
      ['く', 'ク', 'ku'],
      ['け', 'ケ', 'ke'],
      ['こ', 'コ', 'ko'],
    ],
  ],
  [
    'sa',
    'basic',
    [
      ['さ', 'サ', 'sa'],
      ['し', 'シ', 'shi', 'si'],
      ['す', 'ス', 'su'],
      ['せ', 'セ', 'se'],
      ['そ', 'ソ', 'so'],
    ],
  ],
  [
    'ta',
    'basic',
    [
      ['た', 'タ', 'ta'],
      ['ち', 'チ', 'chi', 'ti'],
      ['つ', 'ツ', 'tsu', 'tu'],
      ['て', 'テ', 'te'],
      ['と', 'ト', 'to'],
    ],
  ],
  [
    'na',
    'basic',
    [
      ['な', 'ナ', 'na'],
      ['に', 'ニ', 'ni'],
      ['ぬ', 'ヌ', 'nu'],
      ['ね', 'ネ', 'ne'],
      ['の', 'ノ', 'no'],
    ],
  ],
  [
    'ha',
    'basic',
    [
      ['は', 'ハ', 'ha'],
      ['ひ', 'ヒ', 'hi'],
      ['ふ', 'フ', 'fu', 'hu'],
      ['へ', 'ヘ', 'he'],
      ['ほ', 'ホ', 'ho'],
    ],
  ],
  [
    'ma',
    'basic',
    [
      ['ま', 'マ', 'ma'],
      ['み', 'ミ', 'mi'],
      ['む', 'ム', 'mu'],
      ['め', 'メ', 'me'],
      ['も', 'モ', 'mo'],
    ],
  ],
  [
    'ya',
    'basic',
    [
      ['や', 'ヤ', 'ya'],
      ['ゆ', 'ユ', 'yu'],
      ['よ', 'ヨ', 'yo'],
    ],
  ],
  [
    'ra',
    'basic',
    [
      ['ら', 'ラ', 'ra'],
      ['り', 'リ', 'ri'],
      ['る', 'ル', 'ru'],
      ['れ', 'レ', 're'],
      ['ろ', 'ロ', 'ro'],
    ],
  ],
  [
    'wa',
    'basic',
    [
      ['わ', 'ワ', 'wa'],
      ['を', 'ヲ', 'wo', 'o'],
    ],
  ],
  ['n', 'basic', [['ん', 'ン', 'n', 'nn']]],
  [
    'ga',
    'voiced',
    [
      ['が', 'ガ', 'ga'],
      ['ぎ', 'ギ', 'gi'],
      ['ぐ', 'グ', 'gu'],
      ['げ', 'ゲ', 'ge'],
      ['ご', 'ゴ', 'go'],
    ],
  ],
  [
    'za',
    'voiced',
    [
      ['ざ', 'ザ', 'za'],
      ['じ', 'ジ', 'ji', 'zi'],
      ['ず', 'ズ', 'zu'],
      ['ぜ', 'ゼ', 'ze'],
      ['ぞ', 'ゾ', 'zo'],
    ],
  ],
  [
    'da',
    'voiced',
    [
      ['だ', 'ダ', 'da'],
      ['ぢ', 'ヂ', 'ji', 'di'],
      ['づ', 'ヅ', 'zu', 'du'],
      ['で', 'デ', 'de'],
      ['ど', 'ド', 'do'],
    ],
  ],
  [
    'ba',
    'voiced',
    [
      ['ば', 'バ', 'ba'],
      ['び', 'ビ', 'bi'],
      ['ぶ', 'ブ', 'bu'],
      ['べ', 'ベ', 'be'],
      ['ぼ', 'ボ', 'bo'],
    ],
  ],
  [
    'pa',
    'voiced',
    [
      ['ぱ', 'パ', 'pa'],
      ['ぴ', 'ピ', 'pi'],
      ['ぷ', 'プ', 'pu'],
      ['ぺ', 'ペ', 'pe'],
      ['ぽ', 'ポ', 'po'],
    ],
  ],
  [
    'kya',
    'yoon',
    [
      ['きゃ', 'キャ', 'kya'],
      ['きゅ', 'キュ', 'kyu'],
      ['きょ', 'キョ', 'kyo'],
    ],
  ],
  [
    'sha',
    'yoon',
    [
      ['しゃ', 'シャ', 'sha', 'sya'],
      ['しゅ', 'シュ', 'shu', 'syu'],
      ['しょ', 'ショ', 'sho', 'syo'],
    ],
  ],
  [
    'cha',
    'yoon',
    [
      ['ちゃ', 'チャ', 'cha', 'tya', 'cya'],
      ['ちゅ', 'チュ', 'chu', 'tyu', 'cyu'],
      ['ちょ', 'チョ', 'cho', 'tyo', 'cyo'],
    ],
  ],
  [
    'nya',
    'yoon',
    [
      ['にゃ', 'ニャ', 'nya'],
      ['にゅ', 'ニュ', 'nyu'],
      ['にょ', 'ニョ', 'nyo'],
    ],
  ],
  [
    'hya',
    'yoon',
    [
      ['ひゃ', 'ヒャ', 'hya'],
      ['ひゅ', 'ヒュ', 'hyu'],
      ['ひょ', 'ヒョ', 'hyo'],
    ],
  ],
  [
    'mya',
    'yoon',
    [
      ['みゃ', 'ミャ', 'mya'],
      ['みゅ', 'ミュ', 'myu'],
      ['みょ', 'ミョ', 'myo'],
    ],
  ],
  [
    'rya',
    'yoon',
    [
      ['りゃ', 'リャ', 'rya'],
      ['りゅ', 'リュ', 'ryu'],
      ['りょ', 'リョ', 'ryo'],
    ],
  ],
  [
    'gya',
    'yoon',
    [
      ['ぎゃ', 'ギャ', 'gya'],
      ['ぎゅ', 'ギュ', 'gyu'],
      ['ぎょ', 'ギョ', 'gyo'],
    ],
  ],
  [
    'ja',
    'yoon',
    [
      ['じゃ', 'ジャ', 'ja', 'jya', 'zya'],
      ['じゅ', 'ジュ', 'ju', 'jyu', 'zyu'],
      ['じょ', 'ジョ', 'jo', 'jyo', 'zyo'],
    ],
  ],
  [
    'dya',
    'yoon',
    [
      ['ぢゃ', 'ヂャ', 'ja', 'dya'],
      ['ぢゅ', 'ヂュ', 'ju', 'dyu'],
      ['ぢょ', 'ヂョ', 'jo', 'dyo'],
    ],
  ],
  [
    'bya',
    'yoon',
    [
      ['びゃ', 'ビャ', 'bya'],
      ['びゅ', 'ビュ', 'byu'],
      ['びょ', 'ビョ', 'byo'],
    ],
  ],
  [
    'pya',
    'yoon',
    [
      ['ぴゃ', 'ピャ', 'pya'],
      ['ぴゅ', 'ピュ', 'pyu'],
      ['ぴょ', 'ピョ', 'pyo'],
    ],
  ],
];

export const families: KanaFamily[] = alphabets.flatMap((alphabet) =>
  definitions.map(([name, section, entries]) => {
    const id = `${alphabet}:${name}`;
    return {
      id,
      alphabet,
      section,
      label: entries[0][2],
      cards: entries.map(([hiragana, katakana, reading, ...aliases]) => {
        const kana = alphabet === 'hiragana' ? hiragana : katakana;
        return {
          id: `${alphabet}:${kana}`,
          familyId: id,
          alphabet,
          kana,
          reading,
          aliases,
        };
      }),
    };
  }),
);

export const cards = families.flatMap((family) => family.cards);
