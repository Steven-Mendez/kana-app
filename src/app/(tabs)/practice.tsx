import { Redirect, useLocalSearchParams } from 'expo-router';

/** Practice now lives on Kana; old links keep their category. */
export default function PracticeRedirect() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  return (
    <Redirect
      href={{ pathname: '/kana', params: section ? { section } : {} }}
    />
  );
}
