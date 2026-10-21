import { beforeEach, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));
const owner = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'learner@example.com',
  name: '',
  providers: ['email'],
};
function Account() {
  const { account, signOut } = useAuth();
  return (
    <View>
      <Text>{account?.email ?? 'Guest'}</Text>
      <Button
        title="Sign out"
        onPress={() => {
          void signOut();
        }}
      />
    </View>
  );
}
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  } as never);
  jest
    .mocked(supabase.auth.getSession)
    .mockResolvedValue({ data: { session: null }, error: null });
  jest.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
});

test('expired credentials retain the local account until explicit sign-out', async () => {
  await AsyncStorage.setItem('kana-local-account', JSON.stringify(owner));
  await render(
    <AuthProvider>
      <Account />
    </AuthProvider>,
  );
  expect(await screen.findByText(owner.email)).toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Sign out'));
  expect(await screen.findByText('Guest')).toBeOnTheScreen();
  expect(await AsyncStorage.getItem('kana-local-account')).toBeNull();
});

test('corrupt ownership metadata does not silently expose another account', async () => {
  await AsyncStorage.setItem('kana-local-account', '{bad');
  await render(
    <AuthProvider>
      <Account />
    </AuthProvider>,
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    /Could not restore session/,
  );
  expect(screen.queryByText('Guest')).not.toBeOnTheScreen();
});

test('a failed session refresh does not block offline study', async () => {
  await AsyncStorage.setItem('kana-local-account', JSON.stringify(owner));
  jest
    .mocked(supabase.auth.getSession)
    .mockRejectedValueOnce(new Error('offline'));
  await render(
    <AuthProvider>
      <Account />
    </AuthProvider>,
  );
  expect(await screen.findByText(owner.email)).toBeOnTheScreen();
});
