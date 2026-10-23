import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

export type TabIconName = 'home' | 'kana' | 'profile';

const LINE = {
  strokeWidth: 2.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const WALLS = 'M8 14v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V14';
const ROOF = 'M3.5 16 16 5l12.5 11';
const DOOR = 'M13.5 28v-5a2.5 2.5 0 0 1 5 0v5z';

const BODY = 'M6 27.5c0-5.5 4.5-9 10-9s10 3.5 10 9';

/**
 * Soft-ink tab icons: one line weight in the muted foreground. The selected
 * icon turns primary with an accent fill and a primary detail.
 */
export function TabIcon({
  name,
  selected = false,
  size = 30,
}: {
  name: TabIconName;
  selected?: boolean;
  size?: number;
}) {
  const [muted, primary, accent, onPrimary] = useCSSVariable([
    '--color-muted-foreground',
    '--color-primary',
    '--color-accent',
    '--color-primary-foreground',
  ]).map((value) => (typeof value === 'string' ? value : undefined));
  const stroke = selected ? primary : muted;
  const soft = selected ? accent : 'none';
  const detail = selected ? primary : 'none';

  if (name === 'kana') {
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
          <Rect
            x={4}
            y={4}
            width={24}
            height={24}
            rx={6}
            fill={detail}
            stroke={stroke}
            {...LINE}
          />
        </Svg>
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <Text
            accessible={false}
            allowFontScaling={false}
            className="font-kana"
            style={{
              color: selected ? onPrimary : muted,
              fontSize: size * 0.46,
              lineHeight: size * 0.6,
            }}
          >
            あ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      {name === 'home' ? (
        <>
          <Path d={WALLS} fill={soft} stroke={stroke} {...LINE} />
          <Path d={ROOF} fill="none" stroke={stroke} {...LINE} />
          <Path d={DOOR} fill={detail} stroke={stroke} {...LINE} />
        </>
      ) : (
        <>
          <Path d={BODY} fill={soft} stroke={stroke} {...LINE} />
          <Circle
            cx={16}
            cy={11}
            r={5.5}
            fill={detail}
            stroke={stroke}
            {...LINE}
          />
        </>
      )}
    </Svg>
  );
}
