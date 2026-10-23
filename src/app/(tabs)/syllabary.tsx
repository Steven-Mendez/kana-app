import { Redirect } from 'expo-router';

/** Syllabary now lives on Kana; old links keep working. */
export default function SyllabaryRedirect() {
  return <Redirect href="/kana" />;
}
