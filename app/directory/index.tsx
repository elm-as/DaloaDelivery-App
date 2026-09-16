import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
  ProBadge,
  SearchInput,
  EmptyState,
  RevealablePhone,
} from '@daloa/ui';
import { Bike } from 'lucide-react-native';

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

  return (
    <SafeAreaView style={styles.container}>
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
            icon={<Bike size={32} color={colors.primary.DEFAULT} />}
            title="Aucun livreur trouvé"
            description="Essayez un autre mot-clé."
          />
        ) : (
          filtered.map((d) => (
            <Card
              key={d.id}
              onPress={() => router.push(`/directory/${d.id}` as any)}
              style={styles.driverCard}
            >
              <Avatar uri={d.photo_url} name={d.name} size={50} />

              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{d.name}</Text>
                  {d.is_verified && <ProBadge variant="deliverer" size="xs" />}
                </View>

                <View style={styles.vehicleRow}>
                  <Bike size={12} color={colors.primary[700]} strokeWidth={2.2} />
                  <Text style={styles.vehicle}>{d.vehicle_type?.toUpperCase() || 'MOTO'}</Text>
                </View>
                <RatingStars rating={d.rating ?? 0} totalReviews={d.total_reviews ?? 0} size={11} />
              </View>

              <RevealablePhone phone={d.phone} compact />
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
    backgroundColor: colors.bg.surface,
  },
  searchBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.subtle,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[2],
    backgroundColor: colors.bg.DEFAULT,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
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
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicle: {
    color: colors.primary[700],
    fontSize: 11,
    fontFamily: typography.families.medium,
  },
});
