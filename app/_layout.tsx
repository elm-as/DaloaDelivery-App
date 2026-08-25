import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DriverAuthProvider } from '../src/context/DriverAuthContext';
import { colors } from '@daloa/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30s pour la logistique temps réel
    },
  },
});

export default function DeliveryRootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DriverAuthProvider>
          <StatusBar style="light" backgroundColor="#090D16" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#090D16' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="run/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="directory/index" options={{ headerShown: false }} />
            <Stack.Screen name="directory/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="verification/index" options={{ headerShown: false }} />
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
    </SafeAreaProvider>
  );
}
