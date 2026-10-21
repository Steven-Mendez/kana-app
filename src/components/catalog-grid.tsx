import type { ReactNode } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

import type { KanaFamily } from '@/data/kana';

/** Read down each block on desktop; retain one continuous table on phones. */
export function CatalogGrid({
  families,
  selectable = false,
  children,
}: {
  families: KanaFamily[];
  selectable?: boolean;
  children: (family: KanaFamily) => ReactNode;
}) {
  const { width, fontScale } = useWindowDimensions();
  const desktop =
    process.env.EXPO_OS === 'web' && width >= 1024 && fontScale <= 1.2;
  const half = Math.ceil(families.length / 2);
  const blocks =
    desktop && families.length >= 6
      ? [families.slice(0, half), families.slice(half)]
      : [families];
  const compound = families[0]?.section === 'yoon';
  return (
    <View
      className={`gap-4 pb-4 ${desktop ? 'flex-row items-start gap-12' : ''}`}
    >
      {blocks.map((block) => (
        <View
          key={block[0].id}
          className={`gap-4 ${desktop ? 'min-w-0 flex-1 gap-3' : ''}`}
        >
          {desktop ? (
            <View
              accessible={false}
              className={`flex-row ${selectable ? 'pl-12' : ''}`}
            >
              {(compound ? ['A', 'U', 'O'] : ['A', 'I', 'U', 'E', 'O']).map(
                (vowel) => (
                  <Text
                    key={vowel}
                    className={`text-center text-xs font-bold text-muted-foreground ${compound ? 'w-1/3' : 'w-1/5'}`}
                  >
                    {vowel}
                  </Text>
                ),
              )}
            </View>
          ) : null}
          {block.map(children)}
        </View>
      ))}
    </View>
  );
}
