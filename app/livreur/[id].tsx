import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LivreurRouteRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/directory/${id}` as any} />;
}
