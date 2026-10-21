import type { Language } from '@/lib/copy';

export type Preferences = { theme: 'light' | 'dark'; language: Language };
export const defaultPreferences: Preferences = {
  theme: 'light',
  language: 'es',
};
export const preferencesKey = 'kana-preferences';

export function parsePreferences(raw: string | null): Preferences {
  if (raw === null) return defaultPreferences;
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== 'object' ||
    !('theme' in value) ||
    (value.theme !== 'light' && value.theme !== 'dark') ||
    !('language' in value) ||
    (value.language !== 'es' && value.language !== 'en')
  )
    throw new Error('Invalid preferences');
  return { theme: value.theme, language: value.language };
}

export function createPreferencesStorage(storage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
}) {
  let pending: Promise<unknown> = Promise.resolve();
  return {
    async load() {
      await pending;
      try {
        return {
          preferences: parsePreferences(await storage.getItem(preferencesKey)),
          failed: false,
        };
      } catch {
        return { preferences: defaultPreferences, failed: true };
      }
    },
    save(preferences: Preferences) {
      const serialized = JSON.stringify(preferences);
      const write = pending.then(() =>
        storage.setItem(preferencesKey, serialized),
      );
      pending = write.catch(() => {});
      return write;
    },
  };
}
