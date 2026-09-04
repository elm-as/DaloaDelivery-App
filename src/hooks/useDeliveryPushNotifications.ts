import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { notificationsService } from '@daloa/api';
import { useDriverAuth } from '../context/DriverAuthContext';

if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () =>
        ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        } as any),
    });
  } catch (err) {
    console.warn('[Push Delivery] Impossible d’initialiser le handler:', err);
  }
}

/**
 * Enregistre le token Expo Push du coursier et gère l'ouverture des courses
 * lors du tap sur une notification (nouvelle course disponible ou assignée).
 */
export function useDeliveryPushNotifications() {
  const { user } = useDriverAuth();
  const router = useRouter();
  const responseSub = useRef<Notifications.Subscription | null>(null);

  // 1. Enregistrement du token push pour l'app 'delivery'
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!user?.id) return;

    (async () => {
      try {
        const existing = await Notifications.getPermissionsAsync();
        let granted = existing.granted || existing.status === 'granted';

        if (!granted) {
          const req = await Notifications.requestPermissionsAsync();
          granted = req.granted || req.status === 'granted';
        }
        if (!granted) return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Courses & Alertes',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#EA580C',
          });
        }

        const projectId =
          (Constants.expoConfig?.extra as any)?.eas?.projectId ||
          (Constants as any)?.easConfig?.projectId;

        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );

        if (tokenData?.data) {
          await notificationsService.registerPushToken(user.id, tokenData.data, 'delivery');
        }
      } catch (err) {
        console.warn('[Push Delivery] Enregistrement échoué:', err);
      }
    })();
  }, [user?.id]);

  // 2. Gestion du tap sur une notification
  useEffect(() => {
    if (Platform.OS === 'web') return;
    responseSub.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      const assignmentId = data?.assignmentId || data?.assignment_id || data?.runId;
      if (assignmentId) {
        router.push(`/run/${assignmentId}` as any);
      } else {
        router.push('/(tabs)/available' as any);
      }
    });

    return () => {
      responseSub.current?.remove();
    };
  }, [router]);
}
