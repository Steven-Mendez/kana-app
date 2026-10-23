import { Text, useWindowDimensions, View } from 'react-native';

import { ScreenTitle } from '@/components/game/comic';

export function PageHeading({
  title,
  description,
}: {
  title: string;
  /** Optional; omit it on screens that need no tagline. */
  description?: string;
}) {
  // Phones show the title in the app bar next to the logo.
  const { width } = useWindowDimensions();
  if (width < 768 && !description) return null;
  return (
    <View className="gap-2">
      {width >= 768 ? <ScreenTitle>{title}</ScreenTitle> : null}
      {description ? (
        <Text className="font-ui text-sm leading-6 text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
