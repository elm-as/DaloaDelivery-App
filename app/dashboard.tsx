import React from 'react';
import { Redirect } from 'expo-router';

export default function DashboardRouteRedirect() {
  return <Redirect href="/(tabs)/livreur" />;
}
