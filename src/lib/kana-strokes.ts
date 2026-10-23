import strokeData from '@/data/kana-strokes.json';

export type StrokeGlyph = {
  glyph: string;
  strokes: string[];
  medians: number[][][];
};

const glyphs: Partial<Record<string, Omit<StrokeGlyph, 'glyph'>>> = strokeData;

// Yōon split into their two glyphs; any missing glyph disables the diagram.
export function strokeGlyphs(kana: string): StrokeGlyph[] | null {
  const found = [...kana].map((glyph) => {
    const data = glyphs[glyph];
    return data ? { glyph, ...data } : null;
  });
  return found.every((glyph) => glyph) ? (found as StrokeGlyph[]) : null;
}
