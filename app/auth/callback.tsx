import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase, deliveryPersonService } from '@daloa/api';
import { colors, spacing, typography } from '@daloa/ui';

function parseFragment(fragment?: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fragment) return out;
  for (const pair of fragment.split('&')) {
    const [k, v] = pair.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || '');
  }
  return out;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error_description?: string; returnTo?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const navigateUser = async (userId: string) => {
      try {
        const driverProfile = await deliveryPersonService.getDeliveryPersonByUserId(userId);
        if (cancelled) return;
        if (driverProfile) {
          router.replace('/(tabs)/livreur' as any);
        } else {
          router.replace('/auth/register' as any);
        }
      } catch {
        if (!cancelled) router.replace('/(tabs)/livreur' as any);
      }
    };

    // 1. Écoute immédiate de tout changement de session Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id && !cancelled) {
        await navigateUser(session.user.id);
      }
    });

    const processAuth = async (incomingUrl?: string | null) => {
      try {
        const isWeb = Platform.OS === 'web' && typeof window !== 'undefined' && Boolean(window.location);
        const webSearch = isWeb ? new URLSearchParams(window.location.search) : null;
        const errDesc = params.error_description || webSearch?.get('error_description') || webSearch?.get('error');
        if (errDesc) throw new Error(String(errDesc));

        const code = params.code || webSearch?.get('code');

        if (code) {
          const { data, error: exErr } = await supabase.auth.exchangeCodeForSession(String(code));
          if (exErr) throw exErr;
          if (data.session?.user?.id) {
            await navigateUser(data.session.user.id);
            return;
          }
        } else {
          let frag: string | null = null;
          if (isWeb && window.location.hash) {
            frag = window.location.hash.startsWith('#')
              ? window.location.hash.substring(1)
              : window.location.hash;
          } else {
            const rawUrl = incomingUrl || (await Linking.getInitialURL());
            frag = rawUrl?.includes('#') ? rawUrl.split('#')[1] : null;
          }

          const tokens = parseFragment(frag);
          if (tokens.error_description || tokens.error) {
            throw new Error(tokens.error_description || tokens.error);
          }

          if (tokens.access_token && tokens.refresh_token) {
            const { data, error: sessErr } = await supabase.auth.setSession({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
            });
            if (sessErr) throw sessErr;
            if (data.session?.user?.id) {
              await navigateUser(data.session.user.id);
              return;
            }
          } else {
            const { data: currentSession } = await supabase.auth.getSession();
            if (currentSession?.session?.user?.id) {
              await navigateUser(currentSession.session.user.id);
              return;
            }
          }
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e.message || 'Échec de la connexion. Redirection...');
        setTimeout(() => router.replace('/auth/login' as any), 1500);
      }
    };

    void processAuth();

    const urlSub = Linking.addEventListener('url', ({ url }) => {
      void processAuth(url);
    });

    // Garde-fou anti-blocage : après 3.5s, si la session est active on redirige, sinon repli login
    const safetyTimer = setTimeout(async () => {
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        await navigateUser(data.session.user.id);
      } else {
        router.replace('/auth/login' as any);
      }
    }, 3500);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      urlSub.remove();
      clearTimeout(safetyTimer);
    };
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      <Text style={styles.text}>
        {error ? error : 'Authentification en cours…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[4],
  },
  text: {
    fontSize: typography.sizes.base,
    fontFamily: typography.families.medium,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
