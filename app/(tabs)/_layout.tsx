import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Home, Search, Truck, Package, User } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, useAccent, typography } from '@daloa/ui';
import { useDriverAuth } from '../../src/context/DriverAuthContext';

/* Icône d'onglet avec pill de fond animée (miroir du BottomNavBar web DaloaDelivery).
   Les couleurs viennent des tokens : l'accent est celui du web (#FF9800). */
function DeliveryTabIcon({
  icon: Icon,
  color,
  focused,
  pillColor,
}: {
  icon: any;
  color: string;
  focused: boolean;
  pillColor: string;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, { stiffness: 400, damping: 25 });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.1 }],
  }));

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.activePill, { backgroundColor: pillColor }, pillStyle]} />
      <Animated.View style={iconStyle}>
        <Icon size={21} color={color} strokeWidth={focused ? 2.5 : 1.8} />
      </Animated.View>
    </View>
  );
}

export default function DeliveryTabLayout() {
  const accent = useAccent();
  const { isAuthenticated, driverProfile } = useDriverAuth();
  const isDriver = Boolean(isAuthenticated && driverProfile);

  return (
    <Tabs
      initialRouteName={isDriver ? 'livreur' : 'index'}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: accent.DEFAULT,
        tabBarInactiveTintColor: colors.grey[400],
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 58,
          paddingBottom: Platform.OS === 'ios' ? 24 : 4,
          paddingTop: 4,
          shadowColor: colors.text.DEFAULT,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: typography.families.bold,
          marginTop: 0,
        },
      }}
    >
      {/* ── ONGLETS PUBLICS (Affichés si non-livreur) ── */}
      <Tabs.Screen
        name="index"
        options={{
          href: isDriver ? null : undefined,
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={Home}
              color={color}
              focused={focused}
              pillColor={accent[50]}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="annuaire"
        options={{
          href: isDriver ? null : undefined,
          title: 'Annuaire',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={Search}
              color={color}
              focused={focused}
              pillColor={accent[50]}
            />
          ),
        }}
      />

      {/* ── CONSOLE LIVREUR / DEVENIR LIVREUR ── */}
      <Tabs.Screen
        name="livreur"
        options={{
          title: isDriver ? 'Accueil' : 'Livreur',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={isDriver ? Home : Truck}
              color={color}
              focused={focused}
              pillColor={accent[50]}
            />
          ),
        }}
      />

      {/* ── ONGLETS SPÉCIFIQUES LIVREUR CONNECTÉ (Livraisons & Profil) ── */}
      {/* « Mes livraisons » : les courses DU livreur (en cours + terminées),
          exactement comme /livraisons sur le web. L'onglet montrait auparavant
          les courses disponibles à accepter — un libellé qui ne correspondait
          pas à son contenu. */}
      <Tabs.Screen
        name="history"
        options={{
          href: isDriver ? undefined : null,
          title: 'Livraisons',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={Package}
              color={color}
              focused={focused}
              pillColor={accent[50]}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: isDriver ? undefined : null,
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={User}
              color={color}
              focused={focused}
              pillColor={accent[50]}
            />
          ),
        }}
      />

      {/* ── ROUTES INTERNES LIVREUR (Masquées de la barre) ── */}
      {/* File des offres à accepter : atteinte depuis l'accueil livreur. */}
      <Tabs.Screen
        name="available"
        options={{
          href: null,
          title: 'Courses disponibles',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          href: null,
          title: 'Gains',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 24,
  },
  activePill: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: 2,
    right: 2,
    borderRadius: 10,
  },
});
