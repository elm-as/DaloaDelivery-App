import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@daloa/api';

WebBrowser.maybeCompleteAuthSession();

/** Extrait un paramètre présent en query (?k=v) ou en fragment (#k=v) d'une URL. */
function extractParam(url: string, key: string): string | null {
  const grab = (segment?: string) => {
    if (!segment) return null;
    for (const pair of segment.split('&')) {
      const [k, v] = pair.split('=');
      if (decodeURIComponent(k) === key) return decodeURIComponent(v || '');
    }
    return null;
  };
  const [beforeHash, afterHash] = url.split('#');
  const query = beforeHash.includes('?') ? beforeHash.split('?')[1] : undefined;
  return grab(query) ?? grab(afterHash);
}

/**
 * Connexion Google OAuth pour DaloaDelivery (Expo natif + web).
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('URL d’authentification Google indisponible.');

  // Web : redirection plein navigateur
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = data.url;
    return;
  }

  // Natif : session d'auth contrôlée
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    return;
  }

  const code = extractParam(result.url, 'code');
  if (code) {
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exErr) throw exErr;
    return;
  }

  const accessToken = extractParam(result.url, 'access_token');
  const refreshToken = extractParam(result.url, 'refresh_token');
  if (accessToken && refreshToken) {
    const { error: sErr } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sErr) throw sErr;
    return;
  }

  throw new Error('Retour de connexion Google invalide.');
}
