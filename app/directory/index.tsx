import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Card,
  Avatar,
  RatingStars,
  Badge,
  SearchInput,
  EmptyState,
} from '@daloa/ui';
import { PhoneCall, MapPin, Bike } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DeliverersDirectoryScreen() {
  const router = useRouter();
  const [deliverers, setDeliverers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliverers() {
      try {
        const { data } = await supabase
          .from('delivery_persons')
          .select('*')
          .order('rating', { ascending: false });
        setDeliverers(data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliverers();
  }, []);

  const filtered = deliverers.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCall = (phone: string) => {
    Haptics.lightImpact();
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Annuaire des Livreurs" onBack={() => router.back()} />

      <View style={styles.searchBar}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un livreur par nom ou moto..."
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bike size={32} color={colors.delivery.primary} />}
            title="Aucun livreur trouvé"
            description="Essayez un autre mot-clé."
          />
        ) : (
          filtered.map((d) => (
            <Card
              key={d.id}
              onPress={() => router.push(`/directory/${d.id}`)}
              style={styles.driverCard}
            >
              <Avatar uri={d.photo_url} name={d.name} size={50} />

              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{d.name}</Text>
                  {d.is_verified && <Badge label="VÉRIFIÉ" variant="verified" size="sm" />}
                </View>

                <Text style={styles.vehicle}>🛵 {d.vehicle_type?.toUpperCase() || 'MOTO'}</Text>
                <RatingStars rating={d.rating || 5.0} totalReviews={d.total_reviews || 0} size={11} />
              </View>

              <TouchableOpacity
                onPress={() => handleCall(d.phone)}
                style={styles.callBtn}
              >
                <PhoneCall size={16} color={colors.delivery.primary} />
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  searchBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[2],
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  vehicle: {
    color: colors.delivery.primary,
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    backgroundColor: colors.dark.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
