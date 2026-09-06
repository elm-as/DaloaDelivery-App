import React from 'react';
import { Redirect } from 'expo-router';

export default function InscriptionRouteRedirect() {
  return <Redirect href="/auth/register" />;
}
