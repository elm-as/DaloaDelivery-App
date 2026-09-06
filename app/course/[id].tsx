import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CourseRouteRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/run/${id}` as any} />;
}
