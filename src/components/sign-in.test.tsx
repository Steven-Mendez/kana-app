import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import SignInScreen from '@/app/sign-in';
import {
  sendEmailCode,
  socialSignIn,
  verifyEmailCode,
} from '@/lib/auth-service';

jest.mock('expo-router', () => ({
  Link: jest.requireActual<typeof import('react-native')>('react-native').Text,
  router: { replace: jest.fn() },
}));
jest.mock('@/components/screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({ preferences: { language: 'en' } }),
}));
jest.mock('@/lib/auth-service', () => ({
  sendEmailCode: jest.fn(),
  verifyEmailCode: jest.fn(),
  socialSignIn: jest.fn(),
}));
const authFlags = [
  'EXPO_PUBLIC_ENABLE_GOOGLE_AUTH',
  'EXPO_PUBLIC_ENABLE_APPLE_AUTH',
  'EXPO_PUBLIC_ENABLE_EMAIL_AUTH',
] as const;
const previousFlags = authFlags.map((flag) => process.env[flag]);
afterEach(() => {
  authFlags.forEach((flag, index) => {
    const value = previousFlags[index];
    if (value === undefined) delete process.env[flag];
    else process.env[flag] = value;
  });
});
beforeEach(() => {
  authFlags.forEach((flag) => {
    delete process.env[flag];
  });
  jest.clearAllMocks();
});

test('email code errors retain input, permit retry, and navigate only after verification', async () => {
  process.env.EXPO_PUBLIC_ENABLE_EMAIL_AUTH = 'true';
  jest.mocked(sendEmailCode).mockResolvedValue(undefined);
  jest
    .mocked(verifyEmailCode)
    .mockRejectedValueOnce({ code: 'otp_expired' })
    .mockResolvedValue(undefined);
  await render(<SignInScreen />);
  await fireEvent.changeText(
    screen.getByLabelText('Email address'),
    'learner@example.com',
  );
  await fireEvent.press(screen.getByText('Send code'));
  const input = await screen.findByLabelText('Verification code');
  await fireEvent.changeText(input, '123456');
  await fireEvent.press(screen.getByText('Verify code'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    /invalid or expired/,
  );
  expect(input.props.value).toBe('123456');
  expect(router.replace).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('Verify code'));
  expect(router.replace).toHaveBeenCalledWith('/profile');
});

test('social cancellation is recoverable and never navigates away from guest data', async () => {
  jest.mocked(socialSignIn).mockRejectedValue({ code: 'ERR_REQUEST_CANCELED' });
  await render(<SignInScreen />);
  await fireEvent.press(screen.getByText('Continue with Google'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    /Sign-in cancelled/,
  );
  expect(router.replace).not.toHaveBeenCalled();
  expect(
    screen.getByRole('button', { name: 'Continue with Google' }),
  ).toBeEnabled();
});

test('default access offers Google and guest study without SMTP', async () => {
  await render(<SignInScreen />);
  expect(screen.getByText('Continue with Google')).toBeOnTheScreen();
  expect(screen.queryByText('Continue with Apple')).not.toBeOnTheScreen();
  expect(screen.queryByLabelText('Email address')).not.toBeOnTheScreen();
  expect(screen.getByText('Continue as guest')).toBeOnTheScreen();
});
