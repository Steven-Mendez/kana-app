import * as Apple from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import {
  isEmailAuthEnabled,
  isProviderEnabled,
  isSocialAuthEnabled,
} from '@/lib/auth-features';
import { supabase } from '@/lib/supabase';

export type SocialProvider = 'apple' | 'google';
WebBrowser.maybeCompleteAuthSession();

export function createCodeExchange(exchange: (code: string) => Promise<void>) {
  const exchanges = new Map<string, Promise<void>>();
  return (code: string) => {
    if (!code) return Promise.reject(new Error('Missing authorization code'));
    let pending = exchanges.get(code);
    if (!pending) {
      pending = exchange(code).catch((error) => {
        exchanges.delete(code);
        throw error;
      });
      exchanges.set(code, pending);
    }
    return pending;
  };
}
export const finishOAuth = createCodeExchange(async (code) => {
  if (!isSocialAuthEnabled()) throw new Error('Social access is disabled');
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
});

function redirectUrl() {
  if (process.env.EXPO_OS !== 'web') return 'kana-app://auth/callback';
  const origin = process.env.EXPO_PUBLIC_AUTH_ORIGIN || window.location.origin;
  const url = new URL('/auth/callback', origin);
  if (url.origin !== window.location.origin)
    throw new Error('Authentication origin does not match this site');
  return url.toString();
}

export async function socialSignIn(provider: SocialProvider, link = false) {
  if (!isProviderEnabled(provider))
    throw new Error('Social access is disabled');
  if (provider === 'apple' && process.env.EXPO_OS === 'ios' && !link) {
    const nonce = Crypto.randomUUID();
    const state = Crypto.randomUUID();
    const credential = await Apple.signInAsync({
      requestedScopes: [
        Apple.AppleAuthenticationScope.FULL_NAME,
        Apple.AppleAuthenticationScope.EMAIL,
      ],
      nonce: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
      ),
      state,
    });
    if (!credential.identityToken || credential.state !== state)
      throw new Error('Invalid Apple response');
    const { error } = await supabase.auth.signInWithIdToken({
      provider,
      token: credential.identityToken,
      nonce,
    });
    if (error) throw error;
    const name = [
      credential.fullName?.givenName,
      credential.fullName?.familyName,
    ]
      .filter(Boolean)
      .join(' ');
    if (name) {
      const { error: profileError } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (profileError) throw profileError;
    }
    return;
  }
  const redirectTo = redirectUrl();
  const options = { redirectTo, skipBrowserRedirect: true };
  const result = link
    ? await supabase.auth.linkIdentity({ provider, options })
    : await supabase.auth.signInWithOAuth({ provider, options });
  if (result.error) throw result.error;
  if (!result.data.url) throw new Error('Missing authorization URL');
  if (process.env.EXPO_OS === 'web') {
    window.location.assign(result.data.url);
    return;
  }
  const response = await WebBrowser.openAuthSessionAsync(
    result.data.url,
    redirectTo,
  );
  if (response.type !== 'success')
    throw Object.assign(new Error('Cancelled'), {
      code: 'ERR_REQUEST_CANCELED',
    });
  const url = new URL(response.url);
  if (
    url.protocol !== 'kana-app:' ||
    url.hostname !== 'auth' ||
    url.pathname !== '/callback' ||
    url.searchParams.has('error')
  )
    throw new Error('Invalid authorization callback');
  await finishOAuth(url.searchParams.get('code') ?? '');
}

export async function sendEmailCode(email: string) {
  if (!isEmailAuthEnabled()) throw new Error('Email access is disabled');
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}
export async function verifyEmailCode(email: string, token: string) {
  if (!isEmailAuthEnabled()) throw new Error('Email access is disabled');
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'email',
  });
  if (error) throw error;
}
