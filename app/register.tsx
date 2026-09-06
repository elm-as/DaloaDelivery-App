import React from 'react';
import { Redirect } from 'expo-router';

export default function RegisterRouteRedirect() {
  return <Redirect href="/auth/register" />;
}
