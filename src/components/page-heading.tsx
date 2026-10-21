import { Text, View } from 'react-native';

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="gap-2">
      {process.env.EXPO_OS === 'web' ? (
        <Text
          accessibilityRole="header"
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          {title}
        </Text>
      ) : null}
      <Text className="text-sm leading-6 text-muted-foreground">
        {description}
      </Text>
    </View>
  );
}
