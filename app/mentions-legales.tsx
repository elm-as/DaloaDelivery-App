import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function DeepLinkMentionsLegales() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/legal/legal-notice' as any);
  }, [router]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator color="#FF6B00" />
    </View>
  );
}
