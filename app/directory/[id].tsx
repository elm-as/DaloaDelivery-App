import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Avatar,
  Card,
  Button,
  Badge,
  RatingStars,
} from '@daloa/ui';
import { PhoneCall, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { formatWhatsAppPhone, Haptics } from '@daloa/utils';

export default function DelivererDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [deliverer, setDeliverer] = useState<any>(null);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const { data } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('id', id)
        .single();
      setDeliverer(data);
    }
    fetch();
  }, [id]);

  if (!deliverer) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Profil Livreur" onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Haptics.lightImpact();
    Linking.openURL(`tel:${deliverer.phone}`);
  };

  const handleWhatsApp = () => {
    Haptics.success();
    const phone = formatWhatsAppPhone(deliverer.phone);
    if (!phone) return;
    Linking.openURL(`https://wa.me/${phone}?text=Bonjour%20${deliverer.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={deliverer.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Avatar uri={deliverer.photo_url} name={deliverer.name} size={72} />
          <Text style={styles.name}>{deliverer.name}</Text>
          {deliverer.is_verified && <Badge label="LIVREUR VÉRIFIÉ" variant="verified" />}

          <Text style={styles.vehicle}>🛵 Véhicule : {deliverer.vehicle_type?.toUpperCase() || 'MOTO'}</Text>
          <RatingStars rating={deliverer.rating || 5.0} totalReviews={deliverer.total_reviews || 0} size={14} />

          <View style={styles.btnRow}>
            <Button
              title="Appeler"
              variant="primary"
              size="md"
              leftIcon={<PhoneCall size={16} color="#FFFFFF" />}
              onPress={handleCall}
              style={{ flex: 1 }}
            />
            <Button
              title="WhatsApp"
              variant="whatsapp"
              size="md"
              leftIcon={<MessageCircle size={16} color="#FFFFFF" />}
              onPress={handleWhatsApp}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing[4],
    backgroundColor: '#F8F9FA',
  },
  card: {
    alignItems: 'center',
    padding: spacing[5],
    gap: spacing[2],
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: {
    color: '#111827',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing[2],
  },
  vehicle: {
    color: colors.primary[700],
    fontSize: 12,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
    marginTop: spacing[4],
  },
});
