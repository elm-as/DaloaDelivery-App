import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, DeliveryPersonRow, LoginInput, RegisterInput, Coordinates } from '@daloa/types';
import { authService, deliveryService, supabase, notificationsService } from '@daloa/api';
import * as Location from 'expo-location';
import { DALOA_CENTER } from '@daloa/config';
import { isLocationInDaloa, SecureStorageAdapter } from '@daloa/utils';
import '../lib/location-polyfill';

const CACHED_USER_PROFILE_KEY = 'daloa_cached_user_profile';
const CACHED_DRIVER_PROFILE_KEY = 'daloa_cached_driver_profile';

interface DriverAuthContextType {
  user: any | null;
  profile: UserProfile | null;
  driverProfile: DeliveryPersonRow | null;
  isOnline: boolean;
  driverLocation: Coordinates | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * Confort d'affichage uniquement : masque la console admin aux non-admins.
   * L'autorisation réelle est appliquée en base (policies is_admin() et
   * trigger protect_delivery_persons_columns), jamais par ce booléen.
   */
  isAdmin: boolean;
  toggleOnlineStatus: (status?: boolean) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshDriverProfile: () => Promise<void>;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

/** Rôles donnant accès à la console d'administration. */
const ADMIN_ROLES = ['admin', 'superadmin'];

export const DriverAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DeliveryPersonRow | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      // 1. Hydratation immédiate depuis le stockage persistant (élimine le flash "déconnecté")
      const [cachedUser, cachedDriver] = await Promise.all([
        SecureStorageAdapter.getItem(CACHED_USER_PROFILE_KEY),
        SecureStorageAdapter.getItem(CACHED_DRIVER_PROFILE_KEY),
      ]);
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          if (parsed && typeof parsed === 'object') setProfile(parsed);
        } catch {}
      }
      if (cachedDriver) {
        try {
          const parsedDp = JSON.parse(cachedDriver);
          if (parsedDp && typeof parsedDp === 'object') {
            setDriverProfile(parsedDp);
            setIsOnline(Boolean(parsedDp.is_available));
          }
        } catch {}
      }

      // 2. Synchronisation de la session auprès de Supabase
      const sessionData = await authService.getCurrentSession();
      setUser(sessionData.user);
      if (sessionData.profile) {
        setProfile(sessionData.profile);
        void SecureStorageAdapter.setItem(CACHED_USER_PROFILE_KEY, JSON.stringify(sessionData.profile));
      }
      if (sessionData.deliveryProfile) {
        setDriverProfile(sessionData.deliveryProfile);
        setIsOnline(Boolean(sessionData.deliveryProfile.is_available));
        void SecureStorageAdapter.setItem(CACHED_DRIVER_PROFILE_KEY, JSON.stringify(sessionData.deliveryProfile));
      }
    } catch (err) {
      console.warn('Erreur session livreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Suivi de la position GPS si En Ligne
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isCancelled = false;

    async function startLocationTracking() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || isCancelled) return;

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isCancelled) return;

        const isInside = isLocationInDaloa(loc.coords.latitude, loc.coords.longitude);
        const coords: Coordinates = isInside
          ? { lat: loc.coords.latitude, lng: loc.coords.longitude }
          : { lat: DALOA_CENTER.lat, lng: DALOA_CENTER.lng };
        setDriverLocation(coords);

        if (driverProfile?.id && isOnline) {
          await deliveryService.updateDriverLocation(driverProfile.id, coords);
        }

        if (isCancelled) return;

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 50, // chaque 50 mètres
          },
          (newLoc) => {
            if (isCancelled) return;
            const isNewInside = isLocationInDaloa(newLoc.coords.latitude, newLoc.coords.longitude);
            const newCoords: Coordinates = isNewInside
              ? { lat: newLoc.coords.latitude, lng: newLoc.coords.longitude }
              : { lat: DALOA_CENTER.lat, lng: DALOA_CENTER.lng };
            setDriverLocation(newCoords);
            if (driverProfile?.id && isOnline) {
              deliveryService.updateDriverLocation(driverProfile.id, newCoords);
            }
          }
        );

        if (isCancelled) {
          try {
            sub.remove();
          } catch {
            // Ignorer si déjà nettoyé
          }
        } else {
          locationSubscription = sub;
        }
      } catch (err) {
        console.warn('Erreur GPS livreur:', err);
      }
    }

    if (isOnline) {
      startLocationTracking();
    }

    return () => {
      isCancelled = true;
      if (locationSubscription) {
        try {
          locationSubscription.remove();
        } catch {
          // Sécurisation contre le bug d'EventEmitter sur Web lors de la déconnexion
        }
        locationSubscription = null;
      }
    };
  }, [isOnline, driverProfile?.id]);

  useEffect(() => {
    fetchSession();

    // Écouter les changements d'état d'authentification Supabase de façon synchrone
    // IMPORTANT : Ne jamais exécuter de requêtes Supabase asynchrones dans ce callback
    // sous peine de deadlocker la machine d'état Supabase au réveil de l'app.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setDriverProfile(null);
        setIsOnline(false);
        void SecureStorageAdapter.removeItem(CACHED_USER_PROFILE_KEY);
        void SecureStorageAdapter.removeItem(CACHED_DRIVER_PROFILE_KEY);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Synchronisation du profil coursier en arrière-plan dès que l'utilisateur change
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    async function syncDriverData() {
      try {
        const [{ data: p }, { data: dp }] = await Promise.all([
          supabase.from('users_private').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('delivery_persons').select('*').eq('user_id', user.id).maybeSingle(),
        ]);

        if (isMounted) {
          if (p) {
            setProfile(p as any);
            void SecureStorageAdapter.setItem(CACHED_USER_PROFILE_KEY, JSON.stringify(p));
          }
          const driverRow = dp as DeliveryPersonRow | null;
          if (driverRow) {
            setDriverProfile(driverRow);
            setIsOnline(Boolean(driverRow.is_available));
            void SecureStorageAdapter.setItem(CACHED_DRIVER_PROFILE_KEY, JSON.stringify(driverRow));
          }
        }
      } catch (err) {
        console.warn('Erreur synchronisation données livreur:', err);
      }
    }

    syncDriverData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const toggleOnlineStatus = async (forcedStatus?: boolean) => {
    const nextStatus = forcedStatus !== undefined ? forcedStatus : !isOnline;
    setIsOnline(nextStatus);

    if (driverProfile?.id) {
      await deliveryService.setDriverAvailability(driverProfile.id, nextStatus);
    }
  };

  const login = async (input: LoginInput) => {
    const result = await authService.login(input);
    setUser(result.user);
    if (result.profile) {
      setProfile(result.profile);
      void SecureStorageAdapter.setItem(CACHED_USER_PROFILE_KEY, JSON.stringify(result.profile));
    }

    if (result.user?.id) {
      const { data: dp } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('user_id', result.user.id)
        .maybeSingle();
      const driverRow = dp as DeliveryPersonRow | null;
      if (driverRow) {
        setDriverProfile(driverRow);
        setIsOnline(Boolean(driverRow.is_available));
        void SecureStorageAdapter.setItem(CACHED_DRIVER_PROFILE_KEY, JSON.stringify(driverRow));
      }
    }
  };

  const register = async (input: RegisterInput) => {
    const result = await authService.register({ ...input, role: (input.role as any) || 'livreur' });
    setUser(result.user);
    setProfile(result.profile);
    await fetchSession();
  };

  const logout = async () => {
    try {
      if (driverProfile?.id) {
        await deliveryService.setDriverAvailability(driverProfile.id, false).catch(() => {});
      }
      if (user?.id) {
        await notificationsService.deactivatePushToken(user.id).catch(() => {});
      }
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setDriverProfile(null);
      setIsOnline(false);
      setDriverLocation(null);
      void SecureStorageAdapter.removeItem(CACHED_USER_PROFILE_KEY);
      void SecureStorageAdapter.removeItem(CACHED_DRIVER_PROFILE_KEY);
    }
  };

  const refreshDriverProfile = async () => {
    if (user?.id) {
      const { data: dp } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      const driverRow = dp as DeliveryPersonRow | null;
      setDriverProfile(driverRow);
      setIsOnline(Boolean(driverRow?.is_available));
    }
  };

  return (
    <DriverAuthContext.Provider
      value={{
        user,
        profile,
        driverProfile,
        isOnline,
        driverLocation,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin: ADMIN_ROLES.includes(String((profile as any)?.role || '').toLowerCase()),
        toggleOnlineStatus,
        login,
        register,
        logout,
        refreshDriverProfile,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (!context) {
    throw new Error('useDriverAuth doit être utilisé au sein d’un DriverAuthProvider');
  }
  return context;
};
