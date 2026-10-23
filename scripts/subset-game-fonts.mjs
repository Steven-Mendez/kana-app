/**
 * Generates the game fonts in assets/fonts from the @expo-google-fonts packages.
 *
 * The full Japanese families weigh 2–4 MB per weight. The app only renders
 * Latin text (Spanish and English copy, rōmaji), kana and punctuation with
 * them, so each font is subset to those ranges. Anything outside falls back to
 * the system font. The fonts are licensed under the SIL Open Font License 1.1;
 * each license is copied next to its font.
 *
 * Usage: node scripts/subset-game-fonts.mjs
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import subsetFont from 'subset-font';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets/fonts');

const ranges = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1: ¡ ¿ á é í ó ú ñ ü ×
  [0x100, 0x17f], // Latin Extended-A: macrons in rōmaji
  [0x2010, 0x2027], // dashes, quotes, ellipsis
  [0x2030, 0x203a],
  [0x2190, 0x21ff], // arrows such as ↵
  [0x3000, 0x303f], // CJK punctuation
  [0x3040, 0x309f], // Hiragana
  [0x30a0, 0x30ff], // Katakana
];
const text = ranges
  .flatMap(([from, to]) =>
    Array.from({ length: to - from + 1 }, (_, index) =>
      String.fromCodePoint(from + index),
    ),
  )
  .join('');

const fonts = [
  ['dela-gothic-one', '400Regular/DelaGothicOne_400Regular.ttf'],
  ['zen-kaku-gothic-new', '500Medium/ZenKakuGothicNew_500Medium.ttf'],
  ['zen-kaku-gothic-new', '700Bold/ZenKakuGothicNew_700Bold.ttf'],
  ['zen-maru-gothic', '700Bold/ZenMaruGothic_700Bold.ttf'],
];

await mkdir(out, { recursive: true });
for (const [family, file] of fonts) {
  const source = join(root, 'node_modules/@expo-google-fonts', family, file);
  const subset = await subsetFont(await readFile(source), text, {
    targetFormat: 'truetype',
  });
  const name = file.split('/')[1];
  await writeFile(join(out, name), subset);
  await copyFile(
    join(root, 'node_modules/@expo-google-fonts', family, 'LICENSE_FONT'),
    join(out, `${family}-OFL.txt`),
  );
  console.log(`${name}: ${(subset.length / 1024).toFixed(0)} KB`);
}
