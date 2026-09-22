import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../src/context/DriverAuthContext';
import { DriverBannedScreen } from '../src/components/system/BannedScreen';

export default function DriverBannedRoute() {
  const router = useRouter();
  const { profile, driverProfile, isLoading } = useDriverAuth();
  const isBanned = Boolean(profile?.banned || (profile as any)?.is_banned || (driverProfile as any)?.is_banned);

  useEffect(() => {
    // Si le coursier n'est plus suspendu, redirection vers les onglets
    if (!isLoading && !isBanned) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isBanned, router]);

  return <DriverBannedScreen />;
}
