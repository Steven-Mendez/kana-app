import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { legalCopy } from '@/lib/legal-copy';

export function LegalLinks({ language = 'es' }: { language?: 'es' | 'en' }) {
  const t = legalCopy[language];
  return (
    <View className="flex-row flex-wrap justify-center gap-4">
      {(
        [
          ['/privacy', t.privacy],
          ['/terms', t.terms],
        ] as const
      ).map(([href, label]) => (
        <Link key={href} href={href} asChild>
          <Pressable
            accessibilityRole="link"
            className="min-h-11 justify-center rounded-md active:opacity-60 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Text className="font-ui text-[13px] text-muted-foreground underline">
              {label}
            </Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
