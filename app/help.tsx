import { colors } from '@daloa/ui';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function DeepLinkHelp() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/legal/help' as any);
  }, [router]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.surface }}>
      <ActivityIndicator color={colors.primary.DEFAULT} />
    </View>
  );
}
