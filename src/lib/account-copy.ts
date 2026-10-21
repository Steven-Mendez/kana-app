export const accountCopy = {
  es: {
    title: 'Tu progreso, contigo',
    description: 'Guarda tus repasos y continúa en cualquier dispositivo.',
    apple: 'Continuar con Apple',
    google: 'Continuar con Google',
    email: 'Correo electrónico',
    code: 'Código de verificación',
    send: 'Enviar código',
    verify: 'Verificar código',
    resend: 'Reenviar código',
    changeEmail: 'Cambiar correo',
    sent: 'Revisa tu correo e introduce el código. Si caduca, solicita uno nuevo.',
    wait: 'Espera un momento para volver a enviar el código.',
    error:
      'No se pudo completar la acción. Revisa los datos y tu conexión e inténtalo de nuevo.',
    cancelled: 'Acceso cancelado. Tu progreso sigue guardado.',
    invalidCode: 'El código no es válido o ha caducado. Solicita uno nuevo.',
    limit: 'Demasiados intentos. Espera antes de intentarlo de nuevo.',
    linked: 'Este proveedor ya pertenece a otra cuenta.',
    busy: 'Un momento…',
    guest: 'Continuar como invitado',
    signOut: 'Cerrar sesión',
    providers: 'Métodos de acceso',
    linkApple: 'Vincular Apple',
    linkGoogle: 'Vincular Google',
    linkDone: 'Método de acceso vinculado.',
    local: 'Guardado en este dispositivo',
    syncing: 'Sincronizando',
    synced: 'Sincronizado',
    attention: 'Requiere atención',
    retry: 'Reintentar',
    syncDetail:
      'Los cambios pendientes se conservan en este dispositivo. Reintenta o inicia sesión de nuevo.',
    signIn: 'Iniciar sesión',
    importTitle: 'Tienes progreso de invitado',
    importDetail:
      '¿Quieres incorporar los repasos de este dispositivo a tu cuenta? Tus preferencias de cuenta se conservarán si ya existen.',
    import: 'Incorporar mi progreso',
    skip: 'Continuar con mi cuenta',
    loading: 'Cargando…',
    storageError:
      'No se pudieron leer los datos locales. Se han conservado para que puedas reintentar.',
    pendingSignOut:
      'Los cambios sin sincronizar quedarán en este dispositivo hasta que vuelvas a acceder a esta cuenta.',
  },
  en: {
    title: 'Your progress, with you',
    description: 'Save your reviews and continue on any device.',
    apple: 'Continue with Apple',
    google: 'Continue with Google',
    email: 'Email address',
    code: 'Verification code',
    send: 'Send code',
    verify: 'Verify code',
    resend: 'Resend code',
    changeEmail: 'Change email',
    sent: 'Check your email and enter the code. Request a new one if it expires.',
    wait: 'Please wait before requesting another code.',
    error:
      'Could not complete this action. Check your details and connection, then try again.',
    cancelled: 'Sign-in cancelled. Your progress is still saved.',
    invalidCode: 'This code is invalid or expired. Request a new code.',
    limit: 'Too many attempts. Please wait before trying again.',
    linked: 'This provider already belongs to another account.',
    busy: 'One moment…',
    guest: 'Continue as guest',
    signOut: 'Sign out',
    providers: 'Sign-in methods',
    linkApple: 'Link Apple',
    linkGoogle: 'Link Google',
    linkDone: 'Sign-in method linked.',
    local: 'Saved on this device',
    syncing: 'Syncing',
    synced: 'Synced',
    attention: 'Needs attention',
    retry: 'Retry',
    syncDetail:
      'Pending changes are safe on this device. Retry or sign in again.',
    signIn: 'Sign in',
    importTitle: 'You have guest progress',
    importDetail:
      'Would you like to add reviews from this device to your account? Existing account preferences will be kept.',
    import: 'Add my progress',
    skip: 'Continue with my account',
    loading: 'Loading…',
    storageError:
      'Could not read local data. It has been preserved so you can retry.',
    pendingSignOut:
      'Unsynced changes will stay on this device until you sign into this account again.',
  },
};
export function accountError(error: unknown, language: 'es' | 'en') {
  const code =
    error && typeof error === 'object' && 'code' in error ? error.code : '';
  if (code !== 'ERR_REQUEST_CANCELED') {
    const name = error instanceof Error ? error.name : 'AccountError';
    console.warn('Account action failed', {
      name,
      code: typeof code === 'string' ? code : 'unknown',
    });
  }
  const t = accountCopy[language];
  if (code === 'ERR_REQUEST_CANCELED') return t.cancelled;
  if (code === 'otp_expired') return t.invalidCode;
  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit'
  )
    return t.limit;
  if (code === 'identity_already_exists' || code === 'email_exists')
    return t.linked;
  return t.error;
}
