// Public build flags only control available methods; provider secrets stay in Supabase.
export function isProviderEnabled(provider: 'apple' | 'google'): boolean {
  return provider === 'google'
    ? process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH !== 'false'
    : process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === 'true';
}

export function isEmailAuthEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_EMAIL_AUTH === 'true';
}

export function isSocialAuthEnabled(): boolean {
  return isProviderEnabled('google') || isProviderEnabled('apple');
}
