import React from 'react';
import { useSystemSettings } from '@daloa/api';
import { useDriverAuth } from '../../context/DriverAuthContext';
import { MaintenanceScreen } from './MaintenanceScreen';

/**
 * Garde globale de DaloaDelivery montée au-dessus du routeur :
 * Mode maintenance serveur → écran maintenance (kill-switch) sauf pour admins.
 */
export const AppGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: settings, refetch } = useSystemSettings();
  const { isAdmin } = useDriverAuth();

  // 1. Maintenance (les admins restent autorisés à naviguer)
  if (settings?.maintenance.enabled && !isAdmin) {
    return (
      <MaintenanceScreen
        message={settings.maintenance.message}
        expectedReopening={settings.maintenance.expected_reopening}
        onRetry={() => refetch()}
      />
    );
  }

  return <>{children}</>;
};
