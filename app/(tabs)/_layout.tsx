import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Home, Search, Truck } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, useAccent } from '@daloa/ui';

/* Icône d'onglet avec pill de fond animée (fidèle au BottomNavBar web DaloaDelivery) */
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: colors.grey[400],
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 58,
          paddingBottom: Platform.OS === 'ios' ? 24 : 4,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 0,
        },
      }}
    >
      {/* ── 3 ONGLETS PUBLICS & UNIVERSELS (Fidèles au Web DaloaDelivery) ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={Home}
              color={color}
              focused={focused}
              pillColor="#FFF4E6"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="annuaire"
        options={{
          title: 'Annuaire',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={Search}
              color={color}
              focused={focused}
              pillColor="#FFF4E6"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="livreur"
        options={{
          title: 'Livreur',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon
              icon={Truck}
              color={color}
              focused={focused}
              pillColor="#FFF4E6"
            />
          ),
        }}
      />

      {/* ── ROUTES INTERNES LIVREUR (Masquées de la barre mais navigables) ── */}
      <Tabs.Screen
        name="available"
        options={{
          href: null,
          title: 'Courses',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          href: null,
          title: 'Historique',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          href: null,
          title: 'Gains',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profil',
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
