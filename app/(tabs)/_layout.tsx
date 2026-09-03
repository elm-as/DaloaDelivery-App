import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { LayoutDashboard, Zap, Clock, Wallet, UserCheck } from 'lucide-react-native';
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
        <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
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
        tabBarActiveTintColor: accent.DEFAULT,
        tabBarInactiveTintColor: colors.grey[400],
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Console',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon icon={LayoutDashboard} color={color} focused={focused} pillColor={accent[50]} />
          ),
        }}
      />
      <Tabs.Screen
        name="available"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon icon={Zap} color={color} focused={focused} pillColor={accent[50]} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon icon={Clock} color={color} focused={focused} pillColor={accent[50]} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Gains & Solde',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon icon={Wallet} color={color} focused={focused} pillColor={accent[50]} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon Profil',
          tabBarIcon: ({ color, focused }) => (
            <DeliveryTabIcon icon={UserCheck} color={color} focused={focused} pillColor={accent[50]} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
});
