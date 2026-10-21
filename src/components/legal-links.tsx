import { Link } from 'expo-router';
import { View } from 'react-native';
import { legalCopy } from '@/lib/legal-copy';

export function LegalLinks({ language = 'es' }: { language?: 'es' | 'en' }) {
  const t = legalCopy[language];
  return (
    <View className="flex-row flex-wrap justify-center gap-4">
      <Link
        href="/privacy"
        className="py-3 text-sm text-muted-foreground underline"
      >
        {t.privacy}
      </Link>
      <Link
        href="/terms"
        className="py-3 text-sm text-muted-foreground underline"
      >
        {t.terms}
      </Link>
    </View>
  );
}
