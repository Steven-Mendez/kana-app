/**
 * Generates src/data/kana-strokes.json for the Syllabary stroke-order view.
 *
 * Source: https://github.com/ailectra/kana-json (tag v0.0.1), hiragana and
 * katakana in Hanzi Writer's `{ strokes, medians }` format, derived from
 * AnimCJK (https://github.com/parsimonhi/animCJK). AnimCJK's kana data is
 * licensed under the GNU Lesser General Public License v3 or later and is
 * redistributed unmodified; see src/data/kana-strokes.md.
 *
 * Every glyph of the catalogue is included, splitting yōon into their two
 * characters (きゃ → き, ゃ). The script fails if any glyph is missing upstream
 * so a partial file can never ship.
 *
 * Usage: node scripts/generate-kana-strokes.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG = 'v0.0.1';
const BASE = `https://raw.githubusercontent.com/ailectra/kana-json/${TAG}/data`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogue = await readFile(join(root, 'src/data/kana.ts'), 'utf8');
const glyphs = new Set();
for (const [, hiragana, katakana] of catalogue.matchAll(
  /\['([^']+)', '([^']+)', '[a-z]+'/g,
))
  for (const glyph of [...hiragana, ...katakana]) glyphs.add(glyph);
if (!glyphs.size) throw new Error('No kana found in src/data/kana.ts');

const data = {};
const failed = [];
for (const glyph of [...glyphs].sort()) {
  const response = await fetch(`${BASE}/${encodeURIComponent(glyph)}.json`);
  if (!response.ok) {
    failed.push(`${glyph} (${response.status})`);
    continue;
  }
  const { strokes, medians } = await response.json();
  if (
    !Array.isArray(strokes) ||
    !Array.isArray(medians) ||
    strokes.length !== medians.length
  ) {
    failed.push(`${glyph} (bad shape)`);
    continue;
  }
  data[glyph.normalize('NFC')] = { strokes, medians };
}
if (failed.length)
  throw new Error(`Missing stroke data for: ${failed.join(', ')}`);

await writeFile(
  join(root, 'src/data/kana-strokes.json'),
  `${JSON.stringify(data)}\n`,
);
console.log(`Wrote ${Object.keys(data).length} glyphs`);
