import React from 'react';
import { Redirect } from 'expo-router';

export default function DevenirLivreurRouteRedirect() {
  return <Redirect href="/auth/register" />;
}
