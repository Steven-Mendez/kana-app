import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

import { Icon } from '@/components/icon';
import { strokeGlyphs, type StrokeGlyph } from '@/lib/kana-strokes';
import { usePreferences } from '@/lib/preferences-provider';

const stepMs = 550;

export function KanaStrokes({ kana, size }: { kana: string; size: number }) {
  const { t } = usePreferences();
  const [run, setRun] = useState(0);
  const parts = strokeGlyphs(kana);
  if (!parts) return null;
  const total = parts.reduce((count, glyph) => count + glyph.strokes.length, 0);
  return (
    <View className="flex-row items-center gap-2">
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${kana}. ${t.strokeOrder(total)}`}
        testID="kana-strokes"
      >
        {/* Remounting restarts the animation for a new kana or a replay. */}
        <StrokeAnimation
          key={`${kana}:${run}`}
          parts={parts}
          size={size}
          total={total}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.replayStrokes}
        testID="replay-strokes"
        onPress={() => setRun((value) => value + 1)}
        className="h-11 w-11 items-center justify-center rounded-full bg-muted active:opacity-70 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Icon
          name={{
            ios: 'arrow.counterclockwise',
            android: 'replay',
            web: 'replay',
          }}
          size={18}
        />
      </Pressable>
    </View>
  );
}

function StrokeAnimation({
  parts,
  size,
  total,
}: {
  parts: StrokeGlyph[];
  size: number;
  total: number;
}) {
  const [shown, setShown] = useState(0);
  const [foreground, primary, pending, label] = useCSSVariable([
    '--color-foreground',
    '--color-primary',
    '--color-border',
    '--color-primary-foreground',
  ]).map((value) => (typeof value === 'string' ? value : undefined));

  useEffect(() => {
    if (shown >= total) return;
    const timer = setTimeout(
      () => setShown((value) => Math.min(total, value + 1)),
      stepMs,
    );
    return () => clearTimeout(timer);
  }, [shown, total]);

  // Reduced motion shows the finished, numbered diagram immediately.
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (active && reduce) setShown(total);
    });
    return () => {
      active = false;
    };
  }, [total]);

  // Stroke numbers continue across the glyphs of a yōon.
  const firsts = parts.map((_, index) =>
    parts
      .slice(0, index)
      .reduce((count, glyph) => count + glyph.strokes.length, 0),
  );
  return (
    <View className="flex-row">
      {parts.map((glyph, index) => {
        const first = firsts[index];
        return (
          <Svg
            key={glyph.glyph}
            width={size}
            height={size}
            viewBox="0 0 1024 1024"
          >
            {/* Hanzi Writer data uses a y-up coordinate system. */}
            <G transform="translate(0 900) scale(1 -1)">
              {glyph.strokes.map((path, stroke) => {
                const order = first + stroke;
                return (
                  <Path
                    key={stroke}
                    d={path}
                    fill={
                      order >= shown
                        ? pending
                        : order === shown - 1 && shown < total
                          ? primary
                          : foreground
                    }
                  />
                );
              })}
            </G>
            {glyph.medians.map(([[x, y]], stroke) =>
              first + stroke < shown ? (
                <G key={stroke}>
                  <Circle cx={x} cy={900 - y} r={84} fill={primary} />
                  <SvgText
                    x={x}
                    y={900 - y + 36}
                    fontSize={104}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill={label}
                  >
                    {first + stroke + 1}
                  </SvgText>
                </G>
              ) : null,
            )}
          </Svg>
        );
      })}
    </View>
  );
}
