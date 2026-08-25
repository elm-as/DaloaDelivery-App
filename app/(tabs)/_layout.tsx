import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { LayoutDashboard, Zap, Clock, Wallet, UserCheck } from 'lucide-react-native';
import { colors, typography } from '@daloa/ui';

export default function DeliveryTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.delivery.primary,
        tabBarInactiveTintColor: colors.dark.textDim,
        tabBarStyle: {
          backgroundColor: '#0E1422',
          borderTopColor: colors.dark.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.weights.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="available"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <Zap size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }) => <Clock size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Gains',
          tabBarIcon: ({ color, size }) => <Wallet size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon Profil',
          tabBarIcon: ({ color, size }) => <UserCheck size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
