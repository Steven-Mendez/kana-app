import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Action } from '@/components/action';
import { LegalLinks } from '@/components/legal-links';
import { legalCopy } from '@/lib/legal-copy';

export function LegalScreen({ page }: { page: 'privacy' | 'terms' }) {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const t = legalCopy[language];
  const sections = page === 'privacy' ? t.privacySections : t.termsSections;
  return (
    <View className="flex-1 bg-background web:pt-[env(safe-area-inset-top)] web:pb-[env(safe-area-inset-bottom)]">
      <ScrollView contentContainerClassName="items-center">
        <View className="w-full max-w-2xl gap-6 px-5 py-10">
          <View className="flex-row items-center justify-between gap-3">
            <Link href="/" className="py-3 text-primary underline">
              {t.home}
            </Link>
            <Action
              label={language === 'es' ? 'English' : 'Español'}
              onPress={() => setLanguage(language === 'es' ? 'en' : 'es')}
            />
          </View>
          <Text
            accessibilityRole="header"
            className="text-3xl font-bold text-foreground"
          >
            {t[page]}
          </Text>
          <Text className="text-sm text-muted-foreground">{t.date}</Text>
          {sections.map(([title, text]) => (
            <View key={title} className="gap-2">
              <Text
                accessibilityRole="header"
                className="text-xl font-semibold text-foreground"
              >
                {title}
              </Text>
              <Text selectable className="text-base leading-7 text-foreground">
                {text}
              </Text>
            </View>
          ))}
          <LegalLinks language={language} />
        </View>
      </ScrollView>
    </View>
  );
}
