import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import * as Apple from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

import {
  createCodeExchange,
  finishOAuth,
  sendEmailCode,
  socialSignIn,
  verifyEmailCode,
} from '@/lib/auth-service';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
      linkIdentity: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      signInWithIdToken: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));
jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  signInAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(),
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
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

test('duplicate callbacks exchange a code once; failed exchanges can retry', async () => {
  const exchange = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const finish = createCodeExchange(exchange);
  await Promise.all([finish('one'), finish('one')]);
  await finish('one');
  expect(exchange).toHaveBeenCalledTimes(1);
  exchange.mockRejectedValueOnce(new Error('offline'));
  await expect(finish('two')).rejects.toThrow('offline');
  await finish('two');
  expect(exchange).toHaveBeenCalledTimes(3);
});

test('email access uses OTP and preserves provider errors', async () => {
  process.env.EXPO_PUBLIC_ENABLE_EMAIL_AUTH = 'true';
  jest
    .mocked(supabase.auth.signInWithOtp)
    .mockResolvedValue({ error: null } as never);
  jest
    .mocked(supabase.auth.verifyOtp)
    .mockResolvedValue({ error: null } as never);
  await sendEmailCode(' learner@example.com ');
  expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
    email: 'learner@example.com',
    options: { shouldCreateUser: true },
  });
  await verifyEmailCode('learner@example.com', ' 123456 ');
  expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
    email: 'learner@example.com',
    token: '123456',
    type: 'email',
  });
  jest
    .mocked(supabase.auth.verifyOtp)
    .mockResolvedValue({ error: { code: 'otp_expired' } } as never);
  await expect(
    verifyEmailCode('learner@example.com', '123456'),
  ).rejects.toEqual({ code: 'otp_expired' });
});

test('linking uses the authenticated identity API and does not start another sign-in', async () => {
  const previous = process.env.EXPO_OS;
  process.env.EXPO_OS = 'android';
  jest
    .mocked(supabase.auth.linkIdentity)
    .mockResolvedValue({ error: { code: 'identity_already_exists' } } as never);
  await expect(socialSignIn('google', true)).rejects.toEqual({
    code: 'identity_already_exists',
  });
  expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  process.env.EXPO_OS = previous;
});

test('native Apple hashes the nonce, verifies state and preserves the initial name', async () => {
  process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH = 'true';
  const previous = process.env.EXPO_OS;
  process.env.EXPO_OS = 'ios';
  try {
    jest
      .mocked(Crypto.randomUUID)
      .mockReturnValueOnce('raw-nonce')
      .mockReturnValueOnce('state');
    jest.mocked(Crypto.digestStringAsync).mockResolvedValueOnce('hashed-nonce');
    jest.mocked(Apple.signInAsync).mockResolvedValueOnce({
      state: 'state',
      identityToken: 'test-token',
      fullName: { givenName: 'Test', familyName: 'Learner' },
      email: 'private@privaterelay.appleid.com',
    } as never);
    jest
      .mocked(supabase.auth.signInWithIdToken)
      .mockResolvedValueOnce({ error: null } as never);
    jest
      .mocked(supabase.auth.updateUser)
      .mockResolvedValueOnce({ error: null } as never);
    await socialSignIn('apple');
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'raw-nonce',
    );
    expect(Apple.signInAsync).toHaveBeenCalledWith(
      expect.objectContaining({ nonce: 'hashed-nonce', state: 'state' }),
    );
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'apple',
      token: 'test-token',
      nonce: 'raw-nonce',
    });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { full_name: 'Test Learner' },
    });
    jest.mocked(Crypto.randomUUID).mockReturnValue('new-state');
    jest.mocked(Apple.signInAsync).mockResolvedValueOnce({
      state: 'wrong',
      identityToken: 'test-token',
    } as never);
    await expect(socialSignIn('apple')).rejects.toThrow(
      'Invalid Apple response',
    );
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledTimes(1);
  } finally {
    process.env.EXPO_OS = previous;
  }
});

test('disabled social access cannot launch or exchange authorization codes', async () => {
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH = 'false';
  await expect(socialSignIn('google')).rejects.toThrow('disabled');
  await expect(socialSignIn('apple', true)).rejects.toThrow('disabled');
  await expect(finishOAuth('disabled-code')).rejects.toThrow('disabled');
  expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  expect(supabase.auth.linkIdentity).not.toHaveBeenCalled();
  expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
});

test('Apple and email are blocked by default without preventing Google callbacks', async () => {
  await expect(socialSignIn('apple')).rejects.toThrow('disabled');
  await expect(sendEmailCode('learner@example.com')).rejects.toThrow(
    'disabled',
  );
  await expect(
    verifyEmailCode('learner@example.com', '123456'),
  ).rejects.toThrow('disabled');
  expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
  expect(Apple.signInAsync).not.toHaveBeenCalled();
  jest
    .mocked(supabase.auth.exchangeCodeForSession)
    .mockResolvedValueOnce({ error: null } as never);
  await finishOAuth('google-default-code');
  expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
    'google-default-code',
  );
});
