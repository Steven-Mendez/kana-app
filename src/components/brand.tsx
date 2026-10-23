import { Image, View } from 'react-native';

import { ScreenTitle } from '@/components/game/comic';
import { Depth } from '@/components/game/depth';

/** The fox logo on a softly outlined tile, with the screen or app name. */
export function Brand({ title = 'Kana' }: { title?: string }) {
  return (
    <View className="min-w-0 flex-row items-center gap-3">
      <Depth
        depth={3}
        shapeClassName="rounded-xl"
        faceClassName="overflow-hidden border-2 border-line"
        edgeClassName="bg-shade"
      >
        <Image
          source={require('../../assets/icon.png')}
          accessibilityIgnoresInvertColors
          accessible={false}
          className="size-10"
        />
      </Depth>
      <ScreenTitle size="md">{title}</ScreenTitle>
    </View>
  );
}
