import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DriverAuthProvider } from '../src/context/DriverAuthContext';
import { colors, ThemeProvider } from '@daloa/ui';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';

import { useDeliveryPushNotifications } from '../src/hooks/useDeliveryPushNotifications';

function DeliveryPushRegistrar() {
  useDeliveryPushNotifications();
  return null;
}

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30s pour la logistique temps réel
    },
  },
});

export default function DeliveryRootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider app="delivery">
        <QueryClientProvider client={queryClient}>
          <DriverAuthProvider>
            <DeliveryPushRegistrar />
            <StatusBar style="dark" backgroundColor={colors.neutrals.surface} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.neutrals.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="run/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="directory/index" options={{ headerShown: false }} />
            <Stack.Screen name="directory/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="verification/index" options={{ headerShown: false }} />
            <Stack.Screen name="admin/index" options={{ headerShown: false }} />
            <Stack.Screen name="affiliations/index" options={{ headerShown: false }} />
            <Stack.Screen name="payout-setup/index" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="auth/reset-password" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="banned" options={{ headerShown: false }} />
            <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
            <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
            <Stack.Screen name="legal/help" options={{ headerShown: false }} />
          </Stack>
          </DriverAuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
