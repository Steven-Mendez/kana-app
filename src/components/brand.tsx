import { Image, Text, View } from 'react-native';

export function Brand({ title = 'Kana' }: { title?: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Image
        source={require('../../assets/icon.png')}
        accessibilityIgnoresInvertColors
        accessible={false}
        className="h-9 w-9 rounded-xl"
      />
      <Text className="text-xl font-semibold text-foreground">{title}</Text>
    </View>
  );
}
