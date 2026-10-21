import '@/global.css';

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Kana' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
