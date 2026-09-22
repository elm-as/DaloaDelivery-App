import React from 'react';
import { useSystemSettings } from '@daloa/api';
import { useDriverAuth } from '../../context/DriverAuthContext';
import { MaintenanceScreen } from './MaintenanceScreen';
import { DriverBannedScreen } from './BannedScreen';

/**
 * Garde globale de DaloaDelivery montée au-dessus du routeur :
 *  1. Mode maintenance serveur → écran maintenance (kill-switch) sauf pour admins.
 *  2. Livreur suspendu/banni → écran de blocage et recours sauf pour admins.
 */
export const AppGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: settings, refetch } = useSystemSettings();
  const { user, profile, driverProfile, isLoading, isAdmin } = useDriverAuth();

  // 1. Maintenance (les admins restent autorisés à naviguer)
  if (settings?.maintenance?.enabled && !isAdmin) {
    return (
      <MaintenanceScreen
        message={settings.maintenance.message}
        expectedReopening={settings.maintenance.expected_reopening}
        onRetry={() => refetch()}
      />
    );
  }

  // 2. Livreur banni / suspendu (interdiction totale sauf admin)
  const isBanned = Boolean(profile?.banned || (profile as any)?.is_banned || (driverProfile as any)?.is_banned);
  if (!isLoading && user && isBanned && !isAdmin) {
    return <DriverBannedScreen />;
  }

  return <>{children}</>;
};
