import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, DeliveryPersonRow, LoginInput, RegisterInput, Coordinates } from '@daloa/types';
import { authService, deliveryService, supabase } from '@daloa/api';
import * as Location from 'expo-location';

interface DriverAuthContextType {
  user: any | null;
  profile: UserProfile | null;
  driverProfile: DeliveryPersonRow | null;
  isOnline: boolean;
  driverLocation: Coordinates | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  toggleOnlineStatus: (status?: boolean) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshDriverProfile: () => Promise<void>;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

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
      const sessionData = await authService.getCurrentSession();
      setUser(sessionData.user);
      setProfile(sessionData.profile);
      setDriverProfile(sessionData.deliveryProfile || null);
      setIsOnline(Boolean(sessionData.deliveryProfile?.is_available));
    } catch (err) {
      console.warn('Erreur session livreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Suivi de la position GPS si En Ligne
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    async function startLocationTracking() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords: Coordinates = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };
        setDriverLocation(coords);

        if (driverProfile?.id && isOnline) {
          await deliveryService.updateDriverLocation(driverProfile.id, coords);
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 50, // chaque 50 mètres
          },
          (newLoc) => {
            const newCoords: Coordinates = {
              lat: newLoc.coords.latitude,
              lng: newLoc.coords.longitude,
            };
            setDriverLocation(newCoords);
            if (driverProfile?.id && isOnline) {
              deliveryService.updateDriverLocation(driverProfile.id, newCoords);
            }
          }
        );
      } catch (err) {
        console.warn('Erreur GPS livreur:', err);
      }
    }

    if (isOnline) {
      startLocationTracking();
    }

    return () => {
      locationSubscription?.remove();
    };
  }, [isOnline, driverProfile?.id]);

  useEffect(() => {
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: p } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfile(p as any);

        const { data: dp } = await supabase
          .from('delivery_persons')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setDriverProfile(dp);
        setIsOnline(Boolean(dp?.is_available));
      } else {
        setUser(null);
        setProfile(null);
        setDriverProfile(null);
        setIsOnline(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    setProfile(result.profile);

    if (result.user?.id) {
      const { data: dp } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('user_id', result.user.id)
        .maybeSingle();
      setDriverProfile(dp);
      setIsOnline(Boolean(dp?.is_available));
    }
  };

  const register = async (input: RegisterInput) => {
    const result = await authService.register({ ...input, role: 'delivery' });
    setUser(result.user);
    setProfile(result.profile);
    await fetchSession();
  };

  const logout = async () => {
    if (driverProfile?.id) {
      await deliveryService.setDriverAvailability(driverProfile.id, false);
    }
    await authService.logout();
    setUser(null);
    setProfile(null);
    setDriverProfile(null);
    setIsOnline(false);
  };

  const refreshDriverProfile = async () => {
    if (user?.id) {
      const { data: dp } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setDriverProfile(dp);
      setIsOnline(Boolean(dp?.is_available));
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
